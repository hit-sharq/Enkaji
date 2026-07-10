import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/error"
import { apiRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const rateLimitResult = await apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const body = await request.json()
    const {
      name,
      description,
      price,
      comparePrice,
      inventory,
      categoryId,
      weight,
      images,
      clearanceReason,
      clearanceEndDate,
    } = body

    if (!name || !description || !price || !comparePrice || !inventory || !categoryId || !clearanceReason || !clearanceEndDate) {
      throw new ValidationError("Missing required fields")
    }

    if (Number(comparePrice) <= Number(price)) {
      throw new ValidationError("Original price must be greater than clearance price")
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) {
      throw new ValidationError("Invalid category")
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        comparePrice: Number(comparePrice),
        inventory: Number(inventory),
        categoryId,
        images: Array.isArray(images) ? images : [],
        isClearance: true,
        clearanceReason,
        clearanceEndDate: new Date(clearanceEndDate),
        sellerId: user.id,
        isActive: false,
        isShopApproved: false,
        stockStatus: "IN_STOCK",
        lowStockThreshold: 10,
        unit: "pcs",
        taxRate: 0,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: "clearance_submitted",
        title: "Clearance Request Submitted",
        body: `Your clearance deal "${name}" has been submitted for review. We'll notify you once it's been approved.`,
        data: { productId: product.id },
        read: false,
      },
    })

    return NextResponse.json(
      {
        ...product,
        price: Number(product.price),
        comparePrice: Number(product.comparePrice),
      },
      { status: 201 }
    )
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
