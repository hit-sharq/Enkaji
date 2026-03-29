import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const status = searchParams.get('status')
    const kyc = searchParams.get('kyc')

    const where: any = {}
    if (status) where.status = status
    if (kyc === 'true') where.kycVerified = true
    if (kyc === 'false') where.kycVerified = false

    const [drivers, total] = await Promise.all([
      prisma.lumynDriver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      }),
      prisma.lumynDriver.count({ where }),
    ])

    return NextResponse.json({
      drivers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const driver = await prisma.lumynDriver.create({
      data: body,
      include: { user: true },
    })

    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}

