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
    const { type, title, body: text, data, recipientId } = body

    // Validate required fields
    if (!title || !text || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, body, type' },
        { status: 400 }
      )
    }

    // Determine recipient: if recipientId provided (admin/sender), use that, else current user
    const targetUserId = recipientId || userId

    // Create notification in database
    const notification = await db.notification.create({
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

    // TODO: Send push notification via FCM/APNs using recipient's push tokens
    // For now, just store in DB; push will be sent separately

    return NextResponse.json({ success: true, data: notification })
  } catch (error) {
    console.error('Create notification failed:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 50
    const offset = Number(searchParams.get('offset')) || 0

    const notifications = await db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.notification.count({ where: { userId } })
    const unread = await db.notification.count({ where: { userId, read: false } })

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
