import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { isUserAdmin } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { reviewIds, action, reason } = await request.json()

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json({ error: "Review IDs are required" }, { status: 400 })
    }

    if (!["approve", "reject", "flag"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Get current user for moderation log
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updateData: any = { updatedAt: new Date() }

    switch (action) {
      case "approve":
        updateData.isVerified = true
        updateData.isFlagged = false
        break
      case "reject":
        updateData.isVerified = false
        updateData.isFlagged = false
        break
      case "flag":
        updateData.isFlagged = true
        updateData.isVerified = false
        break
    }

    // Update reviews
    await db.review.updateMany({
      where: { id: { in: reviewIds } },
      data: updateData,
    })

    // Create moderation logs for each review
    const moderationLogs = reviewIds.map((reviewId: string) => ({
      reviewId,
      action,
      reason: reason || `Bulk ${action} by admin`,
      moderatedBy: currentUser.id,
    }))

    await db.reviewModeration.createMany({
      data: moderationLogs,
    })

    return NextResponse.json({
      message: `${reviewIds.length} reviews ${action}d successfully`,
      count: reviewIds.length,
    })
  } catch (error) {
    console.error("Error performing bulk action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
