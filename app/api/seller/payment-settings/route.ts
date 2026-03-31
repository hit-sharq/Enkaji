import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { sellerProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    const body = await request.json()
    const { bankDetails } = body

    if (!bankDetails) {
      return NextResponse.json({ error: "Payment details are required" }, { status: 400 })
    }

    // Validate JSON format
    try {
      JSON.parse(bankDetails)
    } catch (e) {
      return NextResponse.json({ error: "Invalid payment details format" }, { status: 400 })
    }

    // Update seller profile with payment details
    await db.sellerProfile.update({
      where: { userId: user.id },
      data: { bankDetails },
    })

    return NextResponse.json({
      success: true,
      message: "Payment settings saved successfully",
    })
  } catch (error) {
    console.error("Error saving payment settings:", error)
    return handleApiError(error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { sellerProfile: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role !== "SELLER" || !user.sellerProfile) {
      return NextResponse.json({ error: "Seller profile not found" }, { status: 404 })
    }

    let paymentDetails = null
    if (user.sellerProfile.bankDetails) {
      try {
        paymentDetails = JSON.parse(user.sellerProfile.bankDetails)
      } catch (e) {
        console.error("Error parsing payment details:", e)
      }
    }

    return NextResponse.json({
      paymentDetails,
    })
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    return handleApiError(error)
  }
}
