import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * PUT /api/services/providers/profile
 * Update current user's service provider profile
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { businessName, description, phone, whatsapp, address, city, county } = body

    // Find or create provider profile for this user
    let provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    })

    if (!provider) {
      provider = await prisma.serviceProvider.create({
        data: {
          userId: user.id,
          businessName: businessName || `${user.firstName} ${user.lastName}`,
          slug: `${user.firstName}-${user.lastName}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-"),
          email: user.email,
          phone: phone || "",
          whatsapp: whatsapp || phone || "",
          address: address || "",
          city: city || "",
          county: county || "",
          businessType: "general",
          description: description || "",
        },
      })
    } else {
      provider = await prisma.serviceProvider.update({
        where: { userId: user.id },
        data: {
          ...(businessName && { businessName }),
          ...(description && { description }),
          ...(phone && { phone }),
          ...(whatsapp && { whatsapp }),
          ...(address && { address }),
          ...(city && { city }),
          ...(county && { county }),
        },
      })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error("Error updating provider profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

/**
 * GET /api/services/providers/profile
 * Get current user's service provider profile
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    })

    if (!provider) {
      return NextResponse.json({ provider: null })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error("Error fetching provider profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
