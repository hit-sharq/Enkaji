import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const includeEarnings = searchParams.get('earnings') === 'true'

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const driver = await prisma.lumynDriver.findUnique({
      where: { userId: user.id },
      include: includeEarnings
        ? { earnings: { orderBy: { createdAt: 'desc' }, take: 50 } }
        : undefined,
    })

    if (!driver) return NextResponse.json({ error: 'Driver not found' }, { status: 404 })

    return NextResponse.json({ success: true, data: driver })
  } catch (error) {
    console.error('Driver me error:', error)
    return NextResponse.json({ error: 'Failed to fetch driver' }, { status: 500 })
  }
}
