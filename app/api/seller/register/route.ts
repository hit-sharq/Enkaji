import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        sellerProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Handle existing seller - return their profile instead of error
    if (user.role === "SELLER" && user.sellerProfile) {
      return NextResponse.json({
        success: true,
        message: "You already have a seller account",
        isExisting: true,
        sellerProfile: user.sellerProfile,
        redirectTo: "/dashboard",
      })
    }

    // Handle case where user role is SELLER but no profile exists (data inconsistency)
    if (user.role === "SELLER" && !user.sellerProfile) {
      // Allow them to create the missing profile
      const body = await req.json()
      const { businessName, description, location, phoneNumber, website, businessType } = body

      if (!businessName || !location || !phoneNumber || !businessType) {
        return NextResponse.json(
          {
            error: "Missing required fields: businessName, location, phoneNumber, businessType",
          },
          { status: 400 },
        )
      }

      const sellerProfile = await db.sellerProfile.create({
        data: {
          userId: user.id,
          businessName,
          businessType,
          description,
          location,
          phone: phoneNumber,
          website,
        },
      })

      return NextResponse.json({
        success: true,
        message: "Seller profile created successfully",
        sellerProfile,
        isExisting: false,
      })
    }

    // Create new seller profile for non-seller users
    const body = await req.json()
    const { businessName, description, location, phoneNumber, website, businessType } = body

    if (!businessName || !location || !phoneNumber || !businessType) {
      return NextResponse.json(
        {
          error: "Missing required fields: businessName, location, phoneNumber, businessType",
        },
        { status: 400 },
      )
    }

    // Update user role to SELLER
    await db.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    })

    // Create seller profile
    const sellerProfile = await db.sellerProfile.create({
      data: {
        userId: user.id,
        businessName,
        businessType,
        description,
        location,
        phone: phoneNumber,
        website,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Seller account created successfully",
      sellerProfile,
      isExisting: false,
    })
  } catch (error) {
    console.error("Seller registration error:", error)
    return handleApiError(error)
  }
}
