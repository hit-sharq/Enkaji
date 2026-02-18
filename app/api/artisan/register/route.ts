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
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.role === "SELLER") {
      return NextResponse.json({ error: "User is already a seller" }, { status: 400 })
    }

    const body = await req.json()
    const { businessName, description, location, phoneNumber, website, businessType } = body

    // Update user role to SELLER
    await db.user.update({
      where: { id: user.id },
      data: { role: "SELLER" },
    })

    // Get existing slugs to ensure uniqueness
    const existingSlugs = await db.sellerProfile.findMany({
      select: { slug: true },
    })
    const slug = generateUniqueSlug(businessName, existingSlugs.map((s) => s.slug))

    // Create seller profile
    const sellerProfile = await db.sellerProfile.create({
      data: {
        userId: user.id,
        businessName,
        slug,
        description,
        location,
        phone: phoneNumber, // Use phone instead of phoneNumber
        website,
        businessType,
      },
    })

    return NextResponse.json({ success: true, sellerProfile })
  } catch (error) {
    return handleApiError(error)
  }
}
