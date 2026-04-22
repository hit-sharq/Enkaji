export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const businessType = searchParams.get("type")
    const location = searchParams.get("location")

    const where: any = {}

    if (businessType) {
      where.businessType = businessType
    }

    if (location) {
      where.city = { contains: location, mode: "insensitive" }
    }

    const providers = await db.serviceProvider.findMany({
      where,
      include: {
        _count: {
          select: {
            services: { where: { isActive: true } },
            bookings: true,
          },
        },
      },
      orderBy: { averageRating: "desc" },
      take: 50,
    })

    return NextResponse.json({ providers })
  } catch (error) {
    console.error("Error fetching providers:", error)
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a provider profile
    const existingProvider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (existingProvider) {
      return NextResponse.json(
        { error: "You already have a service provider profile" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      businessName,
      description,
      phone,
      whatsapp,
      email,
      address,
      city,
      county,
      businessType,
      yearsExperience,
    } = body

    if (!businessName || !phone || !city || !county || !businessType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36)

    // Use Clerk to get user email if not provided
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { email: true },
    })

    const provider = await db.serviceProvider.create({
      data: {
        userId,
        businessName,
        slug,
        description,
        phone,
        whatsapp: whatsapp || phone,
        email: email || user?.email || "",
        address,
        city,
        county,
        businessType,
        yearsExperience: yearsExperience || null,
      },
    })

    return NextResponse.json({ provider })
  } catch (error) {
    console.error("Error creating provider:", error)
    return NextResponse.json({ error: "Failed to create provider profile" }, { status: 500 })
  }
}