import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const thread = await prisma.messageThread.findUnique({
      where: { id: params.threadId },
      include: {
        participantA: { select: { id: true, firstName: true, lastName: true, imageUrl: true, sellerProfile: { select: { businessName: true } } } },
        participantB: { select: { id: true, firstName: true, lastName: true, imageUrl: true, sellerProfile: { select: { businessName: true } } } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
          },
        },
      },
    })

    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

    const isParticipant = thread.participantAId === user.id || thread.participantBId === user.id
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.message.updateMany({
      where: { threadId: params.threadId, recipientId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return NextResponse.json({ thread })
  } catch (err) {
    console.error('Thread GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { threadId: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const thread = await prisma.messageThread.findUnique({ where: { id: params.threadId } })
    if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

    const isParticipant = thread.participantAId === user.id || thread.participantBId === user.id
    if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const recipientId = thread.participantAId === user.id ? thread.participantBId : thread.participantAId
    const { body } = await req.json()

    if (!body?.trim()) return NextResponse.json({ error: 'Message body required' }, { status: 400 })

    const message = await prisma.message.create({
      data: { threadId: params.threadId, senderId: user.id, recipientId, body: body.trim() },
      include: { sender: { select: { id: true, firstName: true, lastName: true, imageUrl: true } } },
    })

    await prisma.messageThread.update({
      where: { id: params.threadId },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (err) {
    console.error('Thread POST error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
