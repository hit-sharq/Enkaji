import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token, platform } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Upsert push token for user
    await db.user.update({
      where: { clerkId: userId },
      data: {
        pushTokens: {
          upsert: {
            where: { token },
            create: { token, platform: platform || 'unknown', createdAt: new Date() },
            update: { platform: platform || 'unknown', updatedAt: new Date() },
          },
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Register push token failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
