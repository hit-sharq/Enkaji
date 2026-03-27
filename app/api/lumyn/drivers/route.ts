import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      phoneNumber,
      fullName,
      email,
      vehicleType,
      vehicleRegistration,
      licenseNumber,
      idNumber,
      bankAccountName,
      bankAccountNumber,
      bankCode,
    } = body

    const existing = await prisma.lumynDriver.findUnique({
      where: { userId },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Driver profile already exists' },
        { status: 400 }
      )
    }

    const driver = await prisma.lumynDriver.create({
      data: {
        userId,
        phoneNumber,
        fullName,
        email,
        vehicleType,
        vehicleRegistration,
        licenseNumber,
        idNumber,
        bankAccountName,
        bankAccountNumber,
        bankCode,
        status: 'inactive',
      },
    })

    return NextResponse.json({ success: true, data: driver }, { status: 201 })
  } catch (error) {
    console.error('Driver registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register driver' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const driver = await prisma.lumynDriver.findUnique({
      where: { userId },
    })
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    if (!driver.kycVerified || driver.status !== 'active') {
      return NextResponse.json(
        { error: 'Driver not approved for deliveries' },
        { status: 403 }
      )
    }

    const availableDeliveries = await prisma.lumynDelivery.findMany({
      where: {
        status: 'requested',
        driverId: null,
      },
      include: { customer: { select: { firstName: true, lastName: true } } },
      take: 20,
    })

    return NextResponse.json({ success: true, data: availableDeliveries })
  } catch (error) {
    console.error('Available jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch available jobs' },
      { status: 500 }
    )
  }
}
