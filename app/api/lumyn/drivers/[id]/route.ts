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

    const { searchParams } = new URL(req.url)
    const includeEarnings = searchParams.get('earnings') === 'true'

    const driver = await prisma.lumynDriver.findUnique({
      where: { id: params.id },
      include: includeEarnings
        ? {
            earnings: {
              take: 20,
              orderBy: { createdAt: 'desc' },
            },
          }
        : undefined,
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    if (driver.userId !== userId) {
      return NextResponse.json({
        id: driver.id,
        fullName: driver.fullName,
        rating: driver.rating,
        totalDeliveries: driver.totalDeliveries,
        profilePhotoUrl: driver.profilePhotoUrl,
      })
    }

    return NextResponse.json({ success: true, data: driver })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const driver = await prisma.lumynDriver.findUnique({
      where: { id: params.id },
    })

    if (!driver || driver.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await req.json()
    const updatedDriver = await prisma.lumynDriver.update({
      where: { id: params.id },
      data: {
        fullName: body.fullName ?? driver.fullName,
        email: body.email ?? driver.email,
        profilePhotoUrl: body.profilePhotoUrl ?? driver.profilePhotoUrl,
        bankAccountName: body.bankAccountName ?? driver.bankAccountName,
        bankAccountNumber: body.bankAccountNumber ?? driver.bankAccountNumber,
        isAvailable: body.isAvailable ?? driver.isAvailable,
        currentLocationLat: body.currentLocationLat ?? driver.currentLocationLat,
        currentLocationLng: body.currentLocationLng ?? driver.currentLocationLng,
        lastLocationUpdate: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: updatedDriver })
  } catch (error) {
    console.error('Driver update error:', error)
    return NextResponse.json(
      { error: 'Failed to update driver' },
      { status: 500 }
    )
  }
}
