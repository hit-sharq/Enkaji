import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    await requireAdmin()

    const [
      activeDrivers,
      pendingDeliveries,
      totalRevenue,
      completedToday,
      driverEarnings,
    ] = await Promise.all([
      prisma.lumynDriver.count({ where: { isAvailable: true } }),
      prisma.lumynDelivery.count({ where: { status: 'requested' } }),
      prisma.lumynDriverEarning.aggregate({
        _sum: { amount: true },
        where: { status: 'paid' },
      }),
      prisma.lumynDelivery.count({
        where: { 
          status: 'delivered', 
          deliveredAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.lumynDriver.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      activeDrivers,
      pendingDeliveries,
      totalRevenue: totalRevenue._sum?.amount || 0,
      completedToday,
      avgDriverRating: driverEarnings._avg?.rating || 0,
      totalDrivers: driverEarnings._count?.id || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}

