import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const threads = await prisma.messageThread.findMany({
      where: {
        OR: [{ participantAId: user.id }, { participantBId: user.id }],
      },
      include: {
        participantA: { select: { id: true, firstName: true, lastName: true, imageUrl: true, sellerProfile: { select: { businessName: true } } } },
        participantB: { select: { id: true, firstName: true, lastName: true, imageUrl: true, sellerProfile: { select: { businessName: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    const unreadCount = await prisma.message.count({
      where: { recipientId: user.id, isRead: false },
    })

    return NextResponse.json({ threads, unreadCount })
  } catch (err) {
    console.error('Messages GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { recipientId, body, productId } = await req.json()
    if (!recipientId || !body?.trim()) {
      return NextResponse.json({ error: 'recipientId and body are required' }, { status: 400 })
    }
    if (recipientId === user.id) {
      return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })
    }

    const [aId, bId] = [user.id, recipientId].sort()

    let thread = await prisma.messageThread.findFirst({
      where: { participantAId: aId, participantBId: bId, productId: productId || null },
    })

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: { participantAId: aId, participantBId: bId, productId: productId || null },
      })
    }

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: user.id,
        recipientId,
        body: body.trim(),
      },
    })

    await prisma.messageThread.update({
      where: { id: thread.id },
      data: { lastMessageAt: new Date() },
    })

    return NextResponse.json({ message, threadId: thread.id }, { status: 201 })
  } catch (err) {
    console.error('Messages POST error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
