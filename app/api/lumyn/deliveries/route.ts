import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/geolocation'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      itemDescription,
      itemWeightKg,
      itemValue,
      specialHandling,
      paymentMethod,
      linkedOrderId,
    } = body

    if (!pickupAddress || !dropoffAddress || !itemDescription) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const distanceKm = calculateDistance(
      { lat: pickupLat, lng: pickupLng },
      { lat: dropoffLat, lng: dropoffLng }
    )

    const baseFee = 150
    const distanceFee = Math.max(0, (distanceKm - 2) * 20)
    const isPeakHour = [12, 13, 17, 18, 19].includes(new Date().getHours())
    const peakSurcharge = isPeakHour ? baseFee * 0.5 : 0
    const totalAmount = baseFee + distanceFee + peakSurcharge

    const delivery = await prisma.lumynDelivery.create({
      data: {
        deliveryNumber: `LUM-${Date.now()}`,
        customerId: userId,
        pickupAddress,
        pickupLat,
        pickupLng,
        dropoffAddress,
        dropoffLat,
        dropoffLng,
        distanceKm,
        itemDescription,
        itemWeightKg,
        itemValue,
        specialHandling,
        baseFee,
        distanceFee,
        peakSurcharge,
        totalAmount,
        paymentMethod: paymentMethod || 'mpesa',
        linkedOrderId,
        status: 'requested',
      },
      include: {
        driver: true,
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    })

    return NextResponse.json({ success: true, data: delivery })
  } catch (error) {
    console.error('Delivery creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create delivery' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    let deliveries
    if (role === 'driver') {
      const driver = await prisma.lumynDriver.findUnique({
        where: { userId },
      })
      if (!driver) {
        return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
      }
      deliveries = await prisma.lumynDelivery.findMany({
        where: {
          driverId: driver.id,
          ...(status && { status }),
        },
        include: { customer: true, driver: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    } else {
      deliveries = await prisma.lumynDelivery.findMany({
        where: {
          customerId: userId,
          ...(status && { status }),
        },
        include: { driver: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    }

    return NextResponse.json({ success: true, data: deliveries })
  } catch (error) {
    console.error('Fetch deliveries error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    )
  }
}
