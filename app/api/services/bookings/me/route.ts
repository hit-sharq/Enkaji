export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

// GET /api/services/bookings/me - Get current user's bookings as customer
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch user's bookings with service and provider info
    const bookings = await db.booking.findMany({
      where: { customerId: user.id },
      include: {
        service: {
          include: {
            provider: {
              select: {
                businessName: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 50,
    })

    // Format booking for display
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      serviceName: booking.service.name,
      date: booking.date.toISOString().split("T")[0],
      timeSlot: booking.timeSlot,
      status: booking.status,
      price: booking.price.toString(),
      provider: {
        businessName: booking.service.provider.businessName,
        logo: booking.service.provider.logo,
      },
    }))

    return NextResponse.json({ bookings: formattedBookings })
  } catch (error) {
    console.error("Error fetching customer bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
