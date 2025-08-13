import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { productSchema } from "@/lib/validation"
import { handleApiError, NotFoundError, AuthorizationError } from "@/lib/errors"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            sellerProfile: {
              select: {
                businessName: true,
                isVerified: true,
                location: true,
                description: true,
                phone: true,
                website: true,
                businessType: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
        _count: {
          select: {
            favorites: true,
            reviews: true,
          },
        },
      },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    // Calculate average rating
    const avgRating = await prisma.review.aggregate({
      where: { productId: params.id },
      _avg: { rating: true },
    })

    return NextResponse.json({
      ...product,
      averageRating: avgRating._avg?.rating || 0,
    })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    // Check if user owns the product or is admin
    if (product.sellerId !== user.id && user.role !== "ADMIN") {
      throw new AuthorizationError("You can only edit your own products")
    }

    const body = await request.json()
    const validatedData = productSchema.parse(body)

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: true,
        seller: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
            sellerProfile: true,
          },
        },
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthorizationError("Authentication required")
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      throw new NotFoundError("Product not found")
    }

    // Check if user owns the product or is admin
    if (product.sellerId !== user.id && user.role !== "ADMIN") {
      throw new AuthorizationError("You can only delete your own products")
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
