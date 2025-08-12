import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get seller's products
    const products = await prisma.product.findMany({
      where: { sellerId: userId },
      include: {
        category: true,
        _count: {
          select: { reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Get seller's orders through order items
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          sellerId: userId,
        },
      },
      include: {
        order: {
          include: {
            user: true,
          },
        },
        product: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    // Group order items by order
    const ordersMap = new Map<string, any>()
    orderItems.forEach(item => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          ...item.order,
          items: [],
        })
      }
      ordersMap.get(item.orderId).items.push(item)
    })
    const orders = Array.from(ordersMap.values()).slice(0, 10)

    // Calculate stats
    const totalProducts = products.length
    const activeListings = products.filter(p => p.isActive).length
    const totalOrders = orders.length

    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter(order => order.status === "COMPLETED")
      .reduce((sum: number, order: any) => {
        const sellerItems = order.items.filter((item: any) => item.product.sellerId === userId)
        return sum + sellerItems.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0)
      }, 0)

    // Format recent orders for display
    const recentOrders = orders.slice(0, 5).map((order: any) => {
      const sellerItems = order.items.filter((item: any) => item.product.sellerId === userId)
      const firstItem = sellerItems[0]
      const orderTotal = sellerItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

      return {
        id: order.id,
        product: firstItem?.product.name || "Multiple items",
        customer: `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() || "Customer",
        amount: orderTotal,
        status: order.status.toLowerCase(),
        createdAt: order.createdAt,
      }
    })

    return NextResponse.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        activeListings,
      },
      recentOrders,
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        status: product.isActive ? "active" : "inactive",
        images: product.images as string[],
        category: product.category.name,
      })),
    })
  } catch (error) {
    console.error("Error fetching seller dashboard data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
