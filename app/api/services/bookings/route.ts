export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

// GET /api/services/bookings - Provider bookings (protected)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")
    const status = searchParams.get("status")
    const date = searchParams.get("date")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's provider profile
    const provider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const where: any = { providerId: provider.id }

    if (status) {
      where.status = status
    }

    if (date) {
      const targetDate = new Date(date)
      const nextDate = new Date(targetDate)
      nextDate.setDate(nextDate.getDate() + 1)
      where.date = {
        gte: targetDate,
        lt: nextDate,
      }
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        service: true,
        customer: {
          select: {
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

// POST /api/services/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      serviceId,
      date,
      timeSlot,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = body

    if (!serviceId || !date || !timeSlot || !customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get service and provider
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    const bookingDate = new Date(date)
    const [hours, minutes] = timeSlot.split(":").map(Number)
    bookingDate.setHours(hours, minutes, 0, 0)

    const bookingEndTime = new Date(bookingDate)
    bookingEndTime.setMinutes(bookingEndTime.getMinutes() + service.duration)

    // Check for conflicting bookings
    const existingBookings = await db.booking.findMany({
      where: {
        serviceId,
        date: {
          gte: new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate()),
          lt: new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate() + 1),
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
      select: {
        timeSlot: true,
        duration: true,
      },
    })

    for (const existing of existingBookings) {
      const [existingHours, existingMinutes] = existing.timeSlot.split(":").map(Number)
      const existingStart = new Date(bookingDate)
      existingStart.setHours(existingHours, existingMinutes, 0, 0)
      const existingEnd = new Date(existingStart)
      existingEnd.setMinutes(existingEnd.getMinutes() + existing.duration)

      const overlaps = (bookingDate < existingEnd) && (bookingEndTime > existingStart)
      if (overlaps) {
        return NextResponse.json(
          { error: "Time slot not available. Please choose a different time." },
          { status: 409 }
        )
      }
    }

    // Try to find user by phone or create guest booking
    let customerId: string | null = null
    if (customerPhone) {
      const user = await db.user.findFirst({
        where: {
          phone: { contains: customerPhone, mode: "insensitive" },
        },
      })
      customerId = user?.id || null
    }

    const booking = await db.booking.create({
      data: {
        serviceId,
        providerId: service.providerId,
        customerId: customerId || "",
        date: bookingDate,
        timeSlot,
        status: "PENDING",
        duration: service.duration,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        notes: notes || null,
        price: service.price,
        total: service.price,
        paymentStatus: "PENDING",
      },
      include: {
        service: { select: { name: true } },
      },
    })

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

// PATCH /api/services/bookings - Update booking status (provider)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, action, reason } = body

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify ownership
    const provider = await db.serviceProvider.findUnique({
      where: { userId },
    })

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const booking = await db.booking.findFirst({
      where: { id: bookingId, providerId: provider.id },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    let updateData: any = {}

    switch (action) {
      case "confirm":
        updateData = { status: "CONFIRMED", confirmedAt: new Date() }
        break
      case "complete":
        updateData = { status: "COMPLETED", completedAt: new Date() }
        break
      case "cancel":
        updateData = { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason || null }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const updated = await db.booking.update({
      where: { id: bookingId },
      data: updateData,
    })

    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
