import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/blog
 * Get published blog posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: "desc" },
      take: limit,
      skip,
      include: {
        author: {
          select: { firstName: true, lastName: true, imageUrl: true },
        },
      },
    })

    const total = await prisma.blogPost.count({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
    })

    return NextResponse.json({
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching blog posts:", error)
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}
