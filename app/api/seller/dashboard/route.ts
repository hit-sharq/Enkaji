export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { OrderStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get seller's products
    const products = await prisma.product.findMany({
      where: { sellerId: user.id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    // Get orders for seller's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId: user.id,
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate statistics
    const totalProducts = products.length
    const totalOrders = orders.length
    const completedOrders = orders.filter(
      (order) => order.status === OrderStatus.DELIVERED
    ).length
    const pendingOrders = orders.filter(
      (order) => order.status === OrderStatus.PENDING
    ).length

    // Revenue counts all paid/confirmed orders (not just delivered)
    const revenueStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ]
    const totalRevenue = orders
      .filter(
        (order) =>
          revenueStatuses.includes(order.status) ||
          order.paymentStatus === "PAID"
      )
      .reduce((sum, order) => {
        const sellerItems = order.items.filter(
          (item) => item.product.sellerId === user.id
        )
        return sum + sellerItems.reduce((itemSum, item) => itemSum + Number(item.total), 0)
      }, 0)

    const clearanceProducts = products.filter((product) => product.isClearance)
    const clearanceItems = orders.flatMap((order) => order.items.filter((item) => item.product.isClearance))
    const clearanceSales = clearanceItems.reduce((sum, item) => sum + item.quantity, 0)
    const clearanceRevenue = clearanceItems.reduce((sum, item) => sum + Number(item.total), 0)
    const clearanceViews = clearanceProducts.reduce((sum, product) => sum + (product.clearanceViews ?? 0), 0)
    const clearanceInventory = clearanceProducts.reduce((sum, product) => sum + product.inventory, 0)

    return NextResponse.json({
      totalProducts,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalRevenue,
      products,
      orders,
      clearanceStats: {
        totalClearanceListings: clearanceProducts.length,
        totalViews: clearanceViews,
        totalSales: clearanceSales,
        inventoryRemaining: clearanceInventory,
        revenueGenerated: clearanceRevenue,
      },
      clearanceProducts,
    })
  } catch (error) {
    console.error("Error fetching seller dashboard:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
