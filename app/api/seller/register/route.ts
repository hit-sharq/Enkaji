import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { handleApiError } from "@/lib/errors"
import { generateUniqueSlug } from "@/lib/slug"

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
      const { businessName, description, location, phoneNumber, website, businessType, plan = "BASIC" } = body

      if (!businessName || !location || !phoneNumber || !businessType) {
        return NextResponse.json(
          {
            error: "Missing required fields: businessName, location, phoneNumber, businessType",
          },
          { status: 400 },
        )
      }

      // Get existing slugs to ensure uniqueness
      const existingSlugs = await db.sellerProfile.findMany({
        select: { slug: true },
      })
      const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug).filter((slug): slug is string => slug !== null))

      const sellerProfile = await db.sellerProfile.create({
        data: {
          userId: user.id,
          businessName,
          slug,
          businessType,
          description,
          location,
          phone: phoneNumber,
          website,
        },
      })

      // Create subscription
      const now = new Date()
      const periodEnd = new Date()
      periodEnd.setMonth(periodEnd.getMonth() + 1)

      await db.sellerSubscription.create({
        data: {
          sellerId: user.id,
          plan: plan as any,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
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
    const { businessName, description, location, phoneNumber, website, businessType, plan = "BASIC" } = body

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

    // Get existing slugs to ensure uniqueness
    const existingSlugs = await db.sellerProfile.findMany({
      select: { slug: true },
    })
    const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug).filter((slug): slug is string => slug !== null))

    // Create seller profile
    const sellerProfile = await db.sellerProfile.create({
      data: {
        userId: user.id,
        businessName,
        slug,
        businessType,
        description,
        location,
        phone: phoneNumber,
        website,
      },
    })

    // Create subscription
    const now = new Date()
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    await db.sellerSubscription.create({
      data: {
        sellerId: user.id,
        plan: plan as any,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
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
