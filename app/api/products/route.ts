import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit ? Number.parseInt(limit) : undefined,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, images, sellerId, isFeatured = false, isActive = true } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number.parseFloat(price),
        categoryId,
        images,
        sellerId,
        isFeatured,
        isActive,
      },
      include: {
        category: true,
        seller: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
