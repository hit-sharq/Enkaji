import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requirePermission } from "@/lib/auth"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user has permission to moderate reviews
    await requirePermission("reviews.moderate")

    const reviewId = params.id
    const { action, reason } = await request.json() // action: 'approve', 'reject', 'flag'

    const updateData: any = { updatedAt: new Date() }

    switch (action) {
      case "approve":
        updateData.isVerified = true
        break
      case "reject":
        updateData.isVerified = false
        break
      case "flag":
        updateData.isFlagged = true
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update review
    const review = await db.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
    })

    // Create moderation log
    await db.reviewModeration.create({
      data: {
        reviewId,
        action,
        reason: reason || `Review ${action}ed by moderator`,
        moderatedBy: (await requirePermission("reviews.moderate")).id,
      },
    })

    return NextResponse.json({
      message: `Review ${action}ed successfully`,
      review,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
