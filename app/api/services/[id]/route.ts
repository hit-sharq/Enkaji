export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await db.service.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        provider: true,
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Get provider working hours
    const workingHours = await db.workingHour.findMany({
      where: { providerId: service.providerId },
      orderBy: { dayOfWeek: "asc" },
    })

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const formattedHours = dayNames.map((day, index) => {
      const hours = workingHours.find((h) => h.dayOfWeek === index)
      return {
        day,
        open: hours?.openTime,
        close: hours?.closeTime,
        isOpen: hours?.isOpen ?? true,
      }
    })

    // Transform service for response
    const formattedService = {
      ...service,
      workingHours: formattedHours,
      reviews: service.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        date: r.createdAt.toISOString().split("T")[0],
        customerName: r.customer?.firstName || "Anonymous",
      })),
    }

    return NextResponse.json({ service: formattedService })
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Get existing service to verify ownership
    const existingService = await db.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Verify the user owns this service
    const provider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (!provider || existingService.providerId !== provider.id) {
      return NextResponse.json({ error: "Not authorized to modify this service" }, { status: 403 })
    }

    const service = await db.service.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get existing service to verify ownership
    const existingService = await db.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Verify the user owns this service
    const provider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (!provider || existingService.providerId !== provider.id) {
      return NextResponse.json({ error: "Not authorized to delete this service" }, { status: 403 })
    }

    await db.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}