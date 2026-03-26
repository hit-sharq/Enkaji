import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  console.log('Admin stats API called')
  
  // Test DB connection first
  try {
    await prisma.$connect()
    console.log('DB connected successfully')
  } catch (dbError) {
    console.error('DB connection failed:', dbError)
    return NextResponse.json({ error: 'Database connection failed - check DATABASE_URL' }, { status: 500 })
  }

  try {
    const stats = {
      totalUsers: 0,
      activeSellers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
    }

    // Safe query wrapper
    const safeCount = async (query: any) => {
      try {
        return await query
      } catch (e) {
        console.error('Query failed:', e as Error)
        return 0
      }
    }

    const [totalUsers, totalProducts, totalOrders, pendingProducts] = await Promise.all([
      safeCount(prisma.user.count()),
      safeCount(prisma.product.count()),
      safeCount(prisma.order.count()),
      safeCount(prisma.product.count({ where: { isShopApproved: false, isActive: true } })),
    ])

    stats.totalUsers = totalUsers
    stats.totalProducts = totalProducts
    stats.totalOrders = totalOrders
    stats.pendingApprovals = pendingProducts

    // Safe revenue calc
    try {
      const revenueResult = await prisma.order.aggregate({
        _sum: { total: true }
      })
      stats.totalRevenue = Number(revenueResult._sum.total || 0)
    } catch (revenueError) {
      console.error('Revenue query failed:', revenueError as Error)
      stats.totalRevenue = 0
    }

    // Safe active sellers
    try {
      stats.activeSellers = await prisma.user.count({
        where: {
          role: "SELLER",
          sellerProfile: {
            is: {
              isVerified: true
            }
          }
        }
      })
    } catch (sellerError) {
      console.error('Active sellers query failed:', sellerError as Error)
      stats.activeSellers = 0
    }

    console.log('Stats generated:', stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
