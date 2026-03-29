import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const delivery = await prisma.lumynDelivery.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        driver: true,
        ratings: true,
      },
    })
    if (!delivery) return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    return NextResponse.json(delivery)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin()
    const body = await request.json()
    const delivery = await prisma.lumynDelivery.update({
      where: { id: params.id },
      data: body,
      include: { customer: true, driver: true },
    })
    return NextResponse.json(delivery)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 })
  }
}

