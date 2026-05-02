import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token, platform } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    await prisma.pushToken.upsert({
      where: { token },
      update: { platform: platform || 'unknown', updatedAt: new Date() },
      create: { token, userId: user.id, platform: platform || 'unknown', createdAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Register push token failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
