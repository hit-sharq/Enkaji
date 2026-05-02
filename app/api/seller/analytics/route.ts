import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/seller/analytics
 * Get seller analytics data (orders, revenue, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Ensure user is a seller
    if (user.role !== "SELLER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "month" // week, month, year

    // Get date range based on timeframe
    const now = new Date()
    let startDate: Date
    switch (timeframe) {
      case "week":
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getMonth(), 1) // Start of current month
    }

    // Get seller's orders (filter by products they own)
    const sellerOrders = await prisma.orderItem.findMany({
      where: {
        product: { sellerId: user.id },
      },
      select: {
        orderId: true,
        order: {
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
        price: true,
        quantity: true,
      },
    })

    // Aggregate stats
    const totalRevenue = sellerOrders.reduce((sum, item) => sum + Number(item.price * item.quantity), 0)
    const orderCount = new Set(sellerOrders.map((item) => item.orderId)).size
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0

    // Get orders by status
    const ordersByStatus: Record<string, number> = {}
    sellerOrders.forEach((item) => {
      const status = item.order?.status || "UNKNOWN"
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1
    })

    return NextResponse.json({
      analytics: {
        totalRevenue,
        orderCount,
        avgOrderValue,
        ordersByStatus,
        timeframe,
        startDate,
      },
    })
  } catch (error) {
    console.error("Error fetching seller analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
