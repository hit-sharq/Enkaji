import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/services/providers/[slug]/services
 * Get all services for a provider by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const page = parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    const provider = await prisma.serviceProvider.findUnique({
      where: { slug },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const services = await prisma.service.findMany({
      where: { providerId: provider.id, isActive: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
      include: {
        _count: {
          select: { bookings: { where: { status: { in: ["PENDING", "CONFIRMED"] } } } },
        },
      },
    })

    const total = await prisma.service.count({
      where: { providerId: provider.id, isActive: true },
    })

    return NextResponse.json({
      services,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error("Error fetching provider services:", error)
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 })
  }
}
