import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to publish blog posts
    await requirePermission("blog.publish")

    const blogPostId = params.id
    const { published } = await request.json()

    // Update blog post status
    const blogPost = await db.blogPost.update({
      where: { id: blogPostId },
      data: {
        status: published ? "PUBLISHED" : "DRAFT",
        publishedAt: published ? new Date() : null,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: published ? "Blog post published successfully" : "Blog post unpublished",
      blogPost,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
