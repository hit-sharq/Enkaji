import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

/**
 * GET /api/services/providers/[slug]
 * Get a service provider by slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const provider = await prisma.serviceProvider.findUnique({
      where: { slug },
      include: {
        services: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        workingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error("Error fetching provider:", error)
    return NextResponse.json({ error: "Failed to fetch provider" }, { status: 500 })
  }
}
