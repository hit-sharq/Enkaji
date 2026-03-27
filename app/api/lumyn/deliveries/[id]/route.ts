import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const delivery = await prisma.lumynDelivery.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { firstName: true, lastName: true, email: true } },
        driver: {
          select: {
            id: true,
            fullName: true,
            profilePhotoUrl: true,
            rating: true,
            totalDeliveries: true,
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    if (delivery.customerId !== userId) {
      const driver = await prisma.lumynDriver.findUnique({
        where: { userId },
      })
      if (!driver || delivery.driverId !== driver.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    return NextResponse.json({ success: true, data: delivery })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch delivery' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = await req.json()

    const driver = await prisma.lumynDriver.findUnique({
      where: { userId },
    })
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    const delivery = await prisma.lumynDelivery.findUnique({
      where: { id: params.id },
    })
    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 })
    }

    let updatedDelivery

    switch (action) {
      case 'accept':
        updatedDelivery = await prisma.lumynDelivery.update({
          where: { id: params.id },
          data: {
            driverId: driver.id,
            status: 'assigned',
            acceptedAt: new Date(),
          },
        })
        break

      case 'pickup':
        if (delivery.driverId !== driver.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
        updatedDelivery = await prisma.lumynDelivery.update({
          where: { id: params.id },
          data: {
            status: 'picked_up',
            pickedUpAt: new Date(),
          },
        })
        break

      case 'deliver':
        if (delivery.driverId !== driver.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
        updatedDelivery = await prisma.lumynDelivery.update({
          where: { id: params.id },
          data: {
            status: 'delivered',
            deliveredAt: new Date(),
            paymentStatus: 'paid',
          },
        })

        const driverEarning = Math.round(updatedDelivery.totalAmount * 0.8)
        await prisma.lumynDriverEarning.create({
          data: {
            driverId: driver.id,
            deliveryId: params.id,
            amount: driverEarning,
          },
        })

        await prisma.lumynDriver.update({
          where: { id: driver.id },
          data: {
            totalDeliveries: { increment: 1 },
            totalEarnings: { increment: driverEarning },
          },
        })
        break

      case 'cancel':
        updatedDelivery = await prisma.lumynDelivery.update({
          where: { id: params.id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        })
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: updatedDelivery })
  } catch (error) {
    console.error('Delivery action error:', error)
    return NextResponse.json(
      { error: 'Failed to update delivery' },
      { status: 500 }
    )
  }
}
