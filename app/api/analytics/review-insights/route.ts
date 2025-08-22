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
    const productId = searchParams.get("productId")
    const sellerId = searchParams.get("sellerId")

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
      createdAt: { gte: startDate },
    }

    if (productId) {
      where.productId = productId
    }

    if (sellerId) {
      where.product = { sellerId }
    }

    // Get summary stats
    const [totalReviews, pendingReviews, flaggedReviews, reviewsThisMonth, reviewsLastMonth, verifiedReviews] =
      await Promise.all([
        db.review.count({ where }),
        db.review.count({ where: { ...where, isVerified: false, isFlagged: false } }),
        db.review.count({ where: { ...where, isFlagged: true } }),
        db.review.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        }),
        db.review.count({
          where: {
            ...where,
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
              lt: new Date(now.getFullYear(), now.getMonth(), 1),
            },
          },
        }),
        db.review.count({ where: { ...where, isVerified: true } }),
      ])

    const reviewGrowth = reviewsLastMonth > 0 ? ((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth) * 100 : 0

    // Get all reviews for analysis
    const reviews = await db.review.findMany({
      where,
      select: {
        rating: true,
        comment: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Analyze sentiment (simplified - in production, use proper NLP)
    let positive = 0
    let neutral = 0
    let negative = 0

    reviews.forEach((review) => {
      if (review.rating >= 4) positive++
      else if (review.rating === 3) neutral++
      else negative++
    })

    // Analyze review lengths
    let short = 0
    let medium = 0
    let long = 0

    reviews.forEach((review) => {
      const length = review.comment?.length || 0
      if (length < 50) short++
      else if (length <= 200) medium++
      else long++
    })

    // Extract common keywords (simplified)
    const allText = reviews
      .map((r) => r.comment)
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    const words = allText
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3)

    const wordCount = words.reduce(
      (acc, word) => {
        acc[word] = (acc[word] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const commonKeywords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        sentiment: "neutral" as const, // In production, analyze sentiment per word
      }))

    // Calculate average response time (simplified)
    const avgResponseTime = 24 // Mock data - in production, calculate from moderation logs

    const insights = {
      summary: {
        totalReviews,
        pendingReviews,
        flaggedReviews,
        averageResponseTime: avgResponseTime,
        reviewsThisMonth,
        reviewGrowth,
      },
      sentimentAnalysis: {
        positive,
        neutral,
        negative,
      },
      commonKeywords,
      reviewLengthDistribution: {
        short,
        medium,
        long,
      },
      verificationStats: {
        verified: verifiedReviews,
        unverified: totalReviews - verifiedReviews,
      },
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error fetching review insights:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
