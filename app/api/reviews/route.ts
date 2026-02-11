import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, rating, title, comment, images } = await request.json()

    // Validate required fields
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product ID, rating, and comment are required" }, { status: 400 })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Check if user exists in our database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = await db.review.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 })
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: user.id,
        productId,
        rating,
        title: title || null,
        comment,
        images: images || [],
        isVerified: false, // Will be verified after moderation
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const sellerId = searchParams.get("sellerId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const rating = searchParams.get("rating")
    const showUnverified = searchParams.get("showUnverified") === "true"

    if (!productId && !sellerId) {
      return NextResponse.json({ error: "Product ID or Seller ID is required" }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // Build where clause for reviews
    const where: any = {}
    
    if (productId) {
      where.productId = productId
    }
    
    if (sellerId) {
      where.product = { sellerId }
    }

    // Only show verified reviews by default, but allow showing all for admin/moderators
    if (!showUnverified) {
      where.isVerified = true
      where.isFlagged = false
    }

    if (rating) {
      where.rating = Number.parseInt(rating)
    }

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ])

    // Get rating distribution (only verified/non-flagged for stats)
    const ratingDistribution = await db.review.groupBy({
      by: ["rating"],
      where: {
        ...(productId && { productId }),
        ...(sellerId && { product: { sellerId } }),
        isVerified: true,
        isFlagged: false,
      },
      _count: {
        rating: true,
      },
    })

    // Calculate average rating (only verified/non-flagged for stats)
    const avgRating = await db.review.aggregate({
      where: {
        ...(productId && { productId }),
        ...(sellerId && { product: { sellerId } }),
        isVerified: true,
        isFlagged: false,
      },
      _avg: {
        rating: true,
      },
    })

    // Get total count of verified reviews for stats
    const verifiedCount = await db.review.count({
      where: {
        ...(productId && { productId }),
        ...(sellerId && { product: { sellerId } }),
        isVerified: true,
        isFlagged: false,
      },
    })

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      stats: {
        averageRating: avgRating._avg.rating || 0,
        totalReviews: verifiedCount,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.rating
            return acc
          },
          {} as Record<number, number>,
        ),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
