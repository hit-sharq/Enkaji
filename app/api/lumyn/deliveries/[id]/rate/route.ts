import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { rating, comment } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const delivery = await prisma.lumynDelivery.findUnique({
      where: { id: params.id },
    })

    if (!delivery || delivery.customerId !== userId) {
      return NextResponse.json(
        { error: 'Delivery not found or unauthorized' },
        { status: 404 }
      )
    }

    if (delivery.status !== 'delivered') {
      return NextResponse.json(
        { error: 'Can only rate completed deliveries' },
        { status: 400 }
      )
    }

    const deliveryRating = await prisma.lumynDeliveryRating.create({
      data: {
        deliveryId: params.id,
        customerId: userId,
        driverId: delivery.driverId!,
        rating,
        comment,
      },
    })

    const allRatings = await prisma.lumynDeliveryRating.findMany({
      where: { driverId: delivery.driverId! },
    })
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length

    await prisma.lumynDriver.update({
      where: { id: delivery.driverId! },
      data: { rating: avgRating },
    })

    return NextResponse.json({ success: true, data: deliveryRating })
  } catch (error) {
    console.error('Rating error:', error)
    return NextResponse.json({ error: 'Failed to rate delivery' }, { status: 500 })
  }
}
