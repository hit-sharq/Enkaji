import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { isUserAdmin } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the proper admin check that includes environment variable
    const isAdmin = await isUserAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const categoryId = searchParams.get("categoryId") || ""

    const skip = (page - 1) * limit

    const whereConditions: any[] = []

    if (search) {
      whereConditions.push({
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    if (status) {
      whereConditions.push({ isActive: status === 'ACTIVE' })
    }

    if (categoryId) {
      whereConditions.push({ categoryId })
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {}

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          seller: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          category: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
              favorites: true,
            },
          },
        },
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return handleApiError(error)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use the proper admin check that includes environment variable
    const isAdmin = await isUserAdmin(userId)

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { productId, status, featured, reason } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status) {
      // Handle product status validation properly
      const validStatuses = ["PENDING", "APPROVED", "REJECTED", "DRAFT", "PUBLISHED"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.isActive = status === "APPROVED" || status === "PUBLISHED"
    }

    if (typeof featured === "boolean") {
      updateData.featured = featured
    }

    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Get the current user to log the approval
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    })

    // Log the approval action if we have a valid user
    if (status && currentUser) {
      await db.productApproval.create({
        data: {
          productId,
          approvedBy: currentUser.id,
          approved: status === "APPROVED",
          reason: reason || null,
        },
      })
    }

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return handleApiError(error)
  }
}
