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
    const timeRange = searchParams.get("timeRange") || "30d"
    const categoryId = searchParams.get("categoryId")

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(0)
    }

    const where: any = {
      isVerified: true,
      isFlagged: false,
      createdAt: timeRange !== "all" ? { gte: startDate } : undefined,
    }

    if (categoryId) {
      where.product = { categoryId }
    }

    // Get overview stats
    const [totalReviews, avgRating, ratingDistribution] = await Promise.all([
      db.review.count({ where }),
      db.review.aggregate({ where, _avg: { rating: true } }),
      db.review.groupBy({
        by: ["rating"],
        where,
        _count: { rating: true },
      }),
    ])

    // Get previous period for trend calculation
    const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const prevAvgRating = await db.review.aggregate({
      where: {
        ...where,
        createdAt: { gte: prevStartDate, lt: startDate },
      },
      _avg: { rating: true },
    })

    const currentAvg = avgRating._avg.rating || 0
    const prevAvg = prevAvgRating._avg.rating || 0
    const trendPercentage = prevAvg > 0 ? ((currentAvg - prevAvg) / prevAvg) * 100 : 0
    const recentTrend = trendPercentage > 1 ? "up" : trendPercentage < -1 ? "down" : "stable"

    // Get daily trends (last 30 days)
    const dailyTrends = await db.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        AVG(rating::numeric) as average_rating,
        COUNT(*) as review_count
      FROM reviews 
      WHERE created_at >= ${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)}
        AND is_verified = true 
        AND is_flagged = false
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `

    // Get monthly trends (last 12 months)
    const monthlyTrends = await db.$queryRaw`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        AVG(rating::numeric) as average_rating,
        COUNT(*) as review_count
      FROM reviews 
      WHERE created_at >= ${new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)}
        AND is_verified = true 
        AND is_flagged = false
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
      LIMIT 12
    `

    // Get category performance
    const categories = await db.category.findMany({
      include: {
        products: {
          include: {
            reviews: {
              where: {
                isVerified: true,
                isFlagged: false,
                createdAt: timeRange !== "all" ? { gte: startDate } : undefined,
              },
            },
          },
        },
      },
    })

    const categoryStats = categories
      .map((category) => {
        const allReviews = category.products.flatMap((product) => product.reviews)
        if (allReviews.length === 0) return null

        const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
        const ratingDist = allReviews.reduce(
          (acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1
            return acc
          },
          {} as Record<number, number>,
        )

        return {
          categoryId: category.id,
          categoryName: category.name,
          averageRating: avgRating,
          reviewCount: allReviews.length,
          ratingDistribution: ratingDist,
        }
      })
      .filter(Boolean)

    // Get top products
    const topProducts = await db.product.findMany({
      include: {
        reviews: {
          where: {
            isVerified: true,
            isFlagged: false,
            createdAt: timeRange !== "all" ? { gte: startDate } : undefined,
          },
        },
      },
      take: 20,
    })

    const productStats = topProducts
      .map((product) => {
        if (product.reviews.length === 0) return null
        const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        return {
          productId: product.id,
          productName: product.name,
          averageRating: avgRating,
          reviewCount: product.reviews.length,
          images: product.images,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.averageRating - a!.averageRating)
      .slice(0, 10)

    // Get top sellers
    const topSellers = await db.user.findMany({
      where: { role: "SELLER" },
      include: {
        products: {
          include: {
            reviews: {
              where: {
                isVerified: true,
                isFlagged: false,
                createdAt: timeRange !== "all" ? { gte: startDate } : undefined,
              },
            },
          },
        },
      },
      take: 20,
    })

    const sellerStats = topSellers
      .map((seller) => {
        const allReviews = seller.products.flatMap((product) => product.reviews)
        if (allReviews.length === 0) return null

        const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
        return {
          sellerId: seller.id,
          sellerName: `${seller.firstName} ${seller.lastName}`,
          averageRating: avgRating,
          reviewCount: allReviews.length,
          totalProducts: seller.products.length,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b!.averageRating - a!.averageRating)
      .slice(0, 10)

    const analytics = {
      overview: {
        totalReviews,
        averageRating: currentAvg,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.rating
            return acc
          },
          {} as Record<number, number>,
        ),
        recentTrend,
        trendPercentage,
      },
      trends: {
        daily: dailyTrends,
        monthly: monthlyTrends,
      },
      categories: categoryStats,
      topProducts: productStats,
      topSellers: sellerStats,
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching rating analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
