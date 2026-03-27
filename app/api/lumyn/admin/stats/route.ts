import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isUserAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalDeliveries,
      activeDeliveries,
      completedDeliveries,
      cancelledDeliveries,
      totalDrivers,
      activeDrivers,
      pendingKycDrivers,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      recentDeliveries,
    ] = await Promise.all([
      prisma.lumynDelivery.count(),
      prisma.lumynDelivery.count({ where: { status: { in: ['requested', 'assigned', 'picked_up'] } } }),
      prisma.lumynDelivery.count({ where: { status: 'delivered' } }),
      prisma.lumynDelivery.count({ where: { status: 'cancelled' } }),
      prisma.lumynDriver.count(),
      prisma.lumynDriver.count({ where: { status: 'active', kycVerified: true } }),
      prisma.lumynDriver.count({ where: { kycVerified: false } }),
      prisma.lumynDelivery.aggregate({ where: { status: 'delivered' }, _sum: { totalAmount: true } }),
      prisma.lumynDelivery.aggregate({ where: { status: 'delivered', deliveredAt: { gte: startOfDay } }, _sum: { totalAmount: true } }),
      prisma.lumynDelivery.aggregate({ where: { status: 'delivered', deliveredAt: { gte: startOfWeek } }, _sum: { totalAmount: true } }),
      prisma.lumynDelivery.aggregate({ where: { status: 'delivered', deliveredAt: { gte: startOfMonth } }, _sum: { totalAmount: true } }),
      prisma.lumynDelivery.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { firstName: true, lastName: true } },
          driver: { select: { fullName: true } },
        },
      }),
    ])

    const completionRate = totalDeliveries > 0
      ? Math.round((completedDeliveries / totalDeliveries) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        deliveries: {
          total: totalDeliveries,
          active: activeDeliveries,
          completed: completedDeliveries,
          cancelled: cancelledDeliveries,
          completionRate,
        },
        drivers: {
          total: totalDrivers,
          active: activeDrivers,
          pendingKyc: pendingKycDrivers,
        },
        revenue: {
          total: totalRevenue._sum.totalAmount || 0,
          today: todayRevenue._sum.totalAmount || 0,
          week: weekRevenue._sum.totalAmount || 0,
          month: monthRevenue._sum.totalAmount || 0,
        },
        recentDeliveries,
      },
    })
  } catch (error) {
    console.error('Lumyn admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
