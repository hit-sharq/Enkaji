import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const count = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })

    return NextResponse.json({ success: true, data: { count } })
  } catch (error) {
    console.error('Get unread count failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
