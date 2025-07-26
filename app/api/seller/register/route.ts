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

    const body = await request.json()
    const { businessName, description, location, phoneNumber, website, businessType } = body

    // Create or update seller profile
    const sellerProfile = await db.sellerProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName,
        description,
        location,
        phoneNumber,
        website,
        businessType,
      },
      create: {
        userId: user.id,
        businessName,
        description,
        location,
        phoneNumber,
        website,
        businessType,
      },
    })

    // Update user role to SELLER if not already
    if (user.role !== "SELLER") {
      await db.user.update({
        where: { id: user.id },
        data: { role: "SELLER" },
      })
    }

    return NextResponse.json({ message: "Seller profile created successfully", profile: sellerProfile })
  } catch (error) {
    console.error("Error creating seller profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
