import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/blog/[slug]
 * Get a single blog post by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const post = await prisma.blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: {
        author: {
          select: { firstName: true, lastName: true, imageUrl: true },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error fetching blog post:", error)
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}
