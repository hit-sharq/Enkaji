import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const [totalUsers, activeSellers, totalProducts, totalOrders, revenue, pendingProducts] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          role: "SELLER",
          sellerProfile: {
            is: {
              isVerified: true
            }
          }
        }
      }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['total'],
        _sum: {
          total: true
        }
      }).then(groups => groups.reduce((sum, group) => sum + Number(group._sum.total || 0), 0)),
      prisma.product.count({
        where: {
          isShopApproved: false,
          isActive: true
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      activeSellers,
      totalProducts,
      totalOrders,
      totalRevenue: revenue,
      pendingApprovals: pendingProducts
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
