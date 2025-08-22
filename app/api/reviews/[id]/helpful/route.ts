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
    })

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // For now, we'll just return success
    // In a full implementation, you'd track helpful votes in a separate table
    return NextResponse.json({ message: "Helpful vote recorded" })
  } catch (error) {
    console.error("Error recording helpful vote:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
