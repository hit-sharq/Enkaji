import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const location = searchParams.get("location")
    const search = searchParams.get("search")

    const where: any = {
      isActive: true,
    }

    if (category) {
      where.category = { contains: category, mode: "insensitive" }
    }

    if (location) {
      where.city = { contains: location, mode: "insensitive" }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { provider: { businessName: { contains: search, mode: "insensitive" } } },
      ]
    }

    const services = await db.service.findMany({
      where,
      include: {
        provider: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const reviewStats = await db.serviceReview.aggregate({
          where: { serviceId: service.id },
          _avg: { rating: true },
          _count: { id: true },
        })

        return {
          ...service,
          averageRating: reviewStats._avg.rating || 0,
          totalReviews: reviewStats._count.id,
        }
      })
    )

    return NextResponse.json({ services: servicesWithStats })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's provider profile
    const provider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (!provider) {
      return NextResponse.json(
        { error: "You must register as a service provider first" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      category,
      subcategory,
      price,
      priceType,
      duration,
      location,
      city,
      county,
      address,
      availableDays,
      startTime,
      endTime,
    } = body

    if (!name || !category || !price || !city || !county) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now().toString(36)

    const service = await db.service.create({
      data: {
        name,
        slug,
        description,
        category,
        subcategory,
        price,
        priceType: priceType || "FIXED",
        duration: duration || 60,
        location: location || "studio",
        city,
        county,
        address,
        providerId: provider.id, // Use authenticated provider's ID
        availableDays: availableDays || null,
        startTime: startTime || "09:00",
        endTime: endTime || "18:00",
      },
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 })
  }
}