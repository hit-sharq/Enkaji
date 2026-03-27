import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isUserAdmin } from '@/lib/auth'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { action, kycVerified, status } = body

    const driver = await prisma.lumynDriver.findUnique({ where: { id: params.id } })
    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

    const updateData: any = {}

    if (action === 'approve') {
      updateData.kycVerified = true
      updateData.status = 'active'
    } else if (action === 'suspend') {
      updateData.status = 'suspended'
      updateData.isAvailable = false
    } else if (action === 'reactivate') {
      updateData.status = 'active'
    } else {
      if (kycVerified !== undefined) updateData.kycVerified = kycVerified
      if (status !== undefined) updateData.status = status
    }

    const updatedDriver = await prisma.lumynDriver.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ success: true, data: updatedDriver })
  } catch (error) {
    console.error('Driver update error:', error)
    return NextResponse.json({ error: 'Failed to update driver' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isAdmin = await isUserAdmin(userId)
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const driver = await prisma.lumynDriver.findUnique({
      where: { id: params.id },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { customer: { select: { firstName: true, lastName: true } } },
        },
        earnings: { orderBy: { createdAt: 'desc' }, take: 10 },
        ratings: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: driver })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 })
  }
}
