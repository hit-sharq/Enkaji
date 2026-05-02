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
    const { type, title, body: text, data, recipientId } = body

    if (!title || !text || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body, type' },
        { status: 400 }
      )
    }

    const targetUserId = recipientId || user.id

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type,
        title,
        body: text,
        data: data || {},
        read: false,
        createdAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Create notification failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 50
    const offset = Number(searchParams.get('offset')) || 0

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.notification.count({ where: { userId: user.id } })
    const unread = await prisma.notification.count({ where: { userId: user.id, read: false } })

    return NextResponse.json({
      success: true,
      data: notifications,
      meta: { total, unread, limit, offset },
    })
  } catch (error) {
    console.error('Fetch notifications failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
