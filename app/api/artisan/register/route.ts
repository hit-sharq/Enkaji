import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role === "ARTISAN") {
      return NextResponse.json({ error: "User is already an artisan" }, { status: 400 })
    }

    const body = await request.json()
    const { bio, location, phoneNumber, specialties, experience } = body

    // Create artisan profile
    await db.artisanProfile.create({
      data: {
        userId: user.id,
        bio,
        location,
        phoneNumber,
        specialties,
        experience,
        isApproved: false, // Requires admin approval
      },
    })

    // Update user role to ARTISAN
    await db.user.update({
      where: { id: user.id },
      data: { role: "ARTISAN" },
    })

    return NextResponse.json({ message: "Application submitted successfully" })
  } catch (error) {
    console.error("Error registering artisan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
