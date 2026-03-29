import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const driverId = searchParams.get('driverId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (driverId) where.driverId = driverId

    const [deliveries, total] = await Promise.all([
      prisma.lumynDelivery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
      customer: { select: { firstName: true, lastName: true, email: true } },

          driver: true,
        },
      }),
      prisma.lumynDelivery.count({ where }),
    ])

    return NextResponse.json({
      deliveries,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const delivery = await prisma.lumynDelivery.create({
      data: body,
      include: { customer: true, driver: true },
    })
    return NextResponse.json(delivery, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 })
  }
}

