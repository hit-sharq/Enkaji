export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const rating = searchParams.get("rating")
    const search = searchParams.get("search")
    const dateRange = searchParams.get("dateRange")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Build where clause
    const where: any = {}

    if (status === "pending") {
      where.isVerified = false
      where.isFlagged = false
    } else if (status === "approved") {
      where.isVerified = true
      where.isFlagged = false
    } else if (status === "flagged") {
      where.isFlagged = true
    }

    if (rating && rating !== "all") {
      where.rating = Number.parseInt(rating)
    }

    if (search) {
      where.OR = [
        { comment: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { user: { firstName: { contains: search, mode: "insensitive" } } },
        { user: { lastName: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    if (dateRange && dateRange !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case "quarter":
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
          break
        default:
          startDate = new Date(0)
      }

      where.createdAt = { gte: startDate }
    }

    const skip = (page - 1) * limit

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
          product: {
            select: {
              id: true,
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

    // Get stats
    const [totalReviews, pendingReviews, flaggedReviews, avgRating, ratingDistribution, recentReviews] =
      await Promise.all([
        db.review.count(),
        db.review.count({ where: { isVerified: false, isFlagged: false } }),
        db.review.count({ where: { isFlagged: true } }),
        db.review.aggregate({ _avg: { rating: true } }),
        db.review.groupBy({
          by: ["rating"],
          _count: { rating: true },
        }),
        db.review.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ])

    const stats = {
      totalReviews,
      pendingReviews,
      flaggedReviews,
      averageRating: avgRating._avg.rating || 0,
      ratingDistribution: ratingDistribution.reduce(
        (acc, item) => {
          acc[item.rating] = item._count.rating
          return acc
        },
        {} as Record<number, number>,
      ),
      recentReviews,
    }

    return NextResponse.json({
      reviews,
      stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
