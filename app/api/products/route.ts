import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { productSchema } from "@/lib/validation"
import { handleApiError, ValidationError, AuthenticationError } from "@/lib/error"
import { apiRateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "12"), 50) // Max 50 items per page
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const featured = searchParams.get("featured")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const skip = (page - 1) * limit

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

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number.parseFloat(minPrice)
      if (maxPrice) where.price.lte = Number.parseFloat(maxPrice)
    }

    if (featured === "true") {
      where.isFeatured = true
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              favorites: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder as "asc" | "desc",
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = apiRateLimit(request)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.resetTime?.toString() || "",
          },
        },
      )
    }

    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    if (user.role !== "SELLER") {
      throw new ValidationError("Only sellers can create products")
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    })

    if (!category) {
      throw new ValidationError("Invalid category")
    }

    const product = await prisma.product.create({
      data: {
        ...validatedData,
        sellerId: user.id,
        isActive: false, // Requires admin approval
      },
      include: {
        category: true,
        seller: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
