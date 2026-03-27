import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { lat, lng, isAvailable } = await req.json()

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng required' }, { status: 400 })
    }

    const driver = await prisma.lumynDriver.update({
      where: { userId: user.id },
      data: {
        currentLocationLat: lat,
        currentLocationLng: lng,
        lastLocationUpdate: new Date(),
        ...(isAvailable !== undefined ? { isAvailable } : {}),
      },
    })

    return NextResponse.json({ success: true, driver: { id: driver.id, lat, lng, isAvailable: driver.isAvailable } })
  } catch (err) {
    console.error('Location update error:', err)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
