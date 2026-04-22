export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

// POST /api/services/reviews - Create a service review
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { serviceId, bookingId, rating, title, comment, images } = await request.json()

    // Validate required fields
    if (!serviceId || !rating || !comment) {
      return NextResponse.json(
        { error: "Service ID, rating, and comment are required" },
        { status: 400 }
      )
    }

    // Validate rating range (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Verify service exists
    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // If bookingId provided, verify the user completed this booking
    if (bookingId) {
      const booking = await db.booking.findFirst({
        where: {
          id: bookingId,
          customerId: user.id,
          serviceId,
          status: "COMPLETED",
        },
      })

      if (!booking) {
        return NextResponse.json(
          { error: "You must complete a booking before reviewing this service" },
          { status: 400 }
        )
      }
    }

    // Check if user already reviewed this service
    const existingReview = await db.serviceReview.findFirst({
      where: {
        customerId: user.id,
        serviceId,
      },
    })

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this service" }, { status: 400 })
    }

    // Create the review
    const review = await db.serviceReview.create({
      data: {
        serviceId,
        bookingId: bookingId || null,
        customerId: user.id,
        rating,
        title: title || null,
        comment,
        images: images || [],
        // Auto-verified if linked to a completed booking
        isVerified: !!bookingId,
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
    })

    // Update service provider's average rating
    const stats = await db.serviceReview.aggregate({
      where: { serviceId },
      _avg: { rating: true },
      _count: { id: true },
    })

    await db.service.update({
      where: { id: serviceId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.id,
      },
    })

    return NextResponse.json({
      message: "Review submitted successfully",
      review,
    })
  } catch (error) {
    console.error("Error creating service review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

// GET /api/services/reviews - List reviews for a service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!serviceId) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 })
    }

    // Verify service exists
    const service = await db.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const skip = (page - 1) * limit

    // Fetch reviews
    const [reviews, totalCount] = await Promise.all([
      db.serviceReview.findMany({
        where: { serviceId },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.serviceReview.count({ where: { serviceId } }),
    ])

    // Get rating distribution
    const ratingDistribution = await db.serviceReview.groupBy({
      by: ["rating"],
      where: { serviceId },
      _count: { rating: true },
    })

    const avgRating = await db.serviceReview.aggregate({
      where: { serviceId },
      _avg: { rating: true },
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
        totalReviews: totalCount,
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
    console.error("Error fetching service reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
