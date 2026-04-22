export const dynamic = 'force-dynamic'

import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"

// Day names mapping
const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]

// GET /api/services/working-hours - Get provider's working hours
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get("providerId")

    // If providerId not provided, get current user's provider profile
    let targetProviderId = providerId
    if (!targetProviderId) {
      const provider = await db.serviceProvider.findUnique({
        where: { userId },
      })

      if (!provider) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 })
      }
      targetProviderId = provider.id
    }

    const workingHours = await db.workingHour.findMany({
      where: { providerId: targetProviderId },
      orderBy: { dayOfWeek: "asc" },
    })

    // Format as array of 7 days
    const formattedHours = dayNames.map((day, index) => {
      const hours = workingHours.find((h) => h.dayOfWeek === index)
      return {
        day,
        dayOfWeek: index,
        openTime: hours?.openTime || "09:00",
        closeTime: hours?.closeTime || "17:00",
        isOpen: hours?.isOpen ?? true,
        id: hours?.id,
      }
    })

    return NextResponse.json({ workingHours: formattedHours })
  } catch (error) {
    console.error("Error fetching working hours:", error)
    return NextResponse.json({ error: "Failed to fetch working hours" }, { status: 500 })
  }
}

// POST /api/services/working-hours - Create/update working hours (bulk)
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
      return NextResponse.json({ error: "Provider not found" }, { status: 404 })
    }

    const body = await request.json()
    const { workingHours } = body // Expected: [{ dayOfWeek: 0-6, openTime: "HH:MM", closeTime: "HH:MM", isOpen: boolean }]

    if (!Array.isArray(workingHours) || workingHours.length !== 7) {
      return NextResponse.json(
        { error: "Working hours must be an array of 7 days" },
        { status: 400 }
      )
    }

    // Upsert each day's working hours
    const upsertedHours = await Promise.all(
      workingHours.map(async (wh: any) => {
        const { dayOfWeek, openTime, closeTime, isOpen } = wh

        if (dayOfWeek < 0 || dayOfWeek > 6) {
          throw new Error("dayOfWeek must be 0-6")
        }

        if (!openTime || !closeTime) {
          return NextResponse.json(
            { error: "openTime and closeTime are required" },
            { status: 400 }
          )
        }

        // Validate time format
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
          return NextResponse.json(
            { error: "Invalid time format. Use HH:MM (24-hour)" },
            { status: 400 }
          )
        }

        return await db.workingHour.upsert({
          where: {
            providerId_dayOfWeek: {
              providerId: provider.id,
              dayOfWeek,
            },
          },
          update: {
            openTime,
            closeTime,
            isOpen: isOpen ?? true,
          },
          create: {
            providerId: provider.id,
            dayOfWeek,
            openTime,
            closeTime,
            isOpen: isOpen ?? true,
          },
        })
      })
    )

    return NextResponse.json({
      message: "Working hours updated successfully",
      workingHours: upsertedHours,
    })
  } catch (error: any) {
    console.error("Error updating working hours:", error)
    return NextResponse.json({ error: error.message || "Failed to update working hours" }, { status: 500 })
  }
}
