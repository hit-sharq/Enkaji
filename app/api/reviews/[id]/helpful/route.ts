import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reviewId = params.id

    // Check if user exists in our database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if review exists
    const review = await db.review.findUnique({
      where: { id: reviewId },
      include: {
        helpfulVotes: {
          where: { userId: user.id },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Check if user already voted on this review
    const existingVote = review.helpfulVotes.length > 0

    if (existingVote) {
      // Remove the vote (toggle off)
      await db.reviewHelpful.delete({
        where: {
          id: review.helpfulVotes[0].id,
        },
      })

      // Decrement helpful count
      await db.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            decrement: 1,
          },
        },
      })

      return NextResponse.json({ 
        message: "Helpful vote removed",
        isHelpful: false,
        helpfulCount: review.helpfulCount - 1
      })
    } else {
      // Add the vote (toggle on)
      await db.reviewHelpful.create({
        data: {
          reviewId,
          userId: user.id,
        },
      })

      // Increment helpful count
      await db.review.update({
        where: { id: reviewId },
        data: {
          helpfulCount: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({ 
        message: "Helpful vote recorded",
        isHelpful: true,
        helpfulCount: review.helpfulCount + 1
      })
    }
  } catch (error) {
    console.error("Error recording helpful vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
