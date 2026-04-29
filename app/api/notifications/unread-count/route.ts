import { NextRequest, NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs'
import db from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await db.notification.count({
      where: { userId, read: false },
    })

    return NextResponse.json({ success: true, data: { count } })
  } catch (error) {
    console.error('Get unread count failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
