import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      )
    }

    const subscriptions = await prisma.sellerSubscription.findMany({
      include: {
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            sellerProfile: {
              select: {
                businessName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const stats = {
      total: subscriptions.length,
      basic: subscriptions.filter(s => s.plan === "BASIC").length,
      premium: subscriptions.filter(s => s.plan === "PREMIUM").length,
      enterprise: subscriptions.filter(s => s.plan === "ENTERPRISE").length,
      active: subscriptions.filter(s => s.status === "ACTIVE").length,
      cancelled: subscriptions.filter(s => s.status === "CANCELLED").length,
      pastDue: subscriptions.filter(s => s.status === "PAST_DUE").length,
    }

    return NextResponse.json({
      subscriptions,
      stats,
    })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    )
  }
}

