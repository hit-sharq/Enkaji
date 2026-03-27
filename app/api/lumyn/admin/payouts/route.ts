import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

async function isAdmin(clerkId: string) {
  const adminIds = (process.env.ADMIN_IDS || '').split(',').map(s => s.trim())
  if (adminIds.includes(clerkId)) return true
  const user = await prisma.user.findUnique({ where: { clerkId } })
  return user?.role === 'ADMIN'
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    const [earnings, total] = await Promise.all([
      prisma.lumynDriverEarning.findMany({
        where: { status },
        skip,
        take: limit,
        include: {
          driver: { select: { fullName: true, phoneNumber: true, bankAccountName: true, bankAccountNumber: true, bankCode: true } },
          delivery: { select: { deliveryNumber: true, deliveredAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lumynDriverEarning.count({ where: { status } }),
    ])

    const summary = await prisma.lumynDriverEarning.groupBy({
      by: ['status'],
      _sum: { netAmount: true },
      _count: true,
    })

    return NextResponse.json({ earnings, total, pages: Math.ceil(total / limit), summary })
  } catch (err) {
    console.error('Payouts GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch payouts' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { earningIds, action, pesapalRef } = await req.json()

    if (!earningIds?.length || !action) {
      return NextResponse.json({ error: 'earningIds and action required' }, { status: 400 })
    }

    if (action === 'mark_paid') {
      await prisma.lumynDriverEarning.updateMany({
        where: { id: { in: earningIds } },
        data: { status: 'paid', payoutDate: new Date(), ...(pesapalRef ? { pesapalRef } : {}) },
      })

      for (const earningId of earningIds) {
        const earning = await prisma.lumynDriverEarning.findUnique({
          where: { id: earningId },
          select: { driverId: true, netAmount: true },
        })
        if (earning) {
          await prisma.lumynDriver.update({
            where: { id: earning.driverId },
            data: { totalEarnings: { increment: earning.netAmount } },
          })
        }
      }

      return NextResponse.json({ success: true, message: `${earningIds.length} earnings marked as paid` })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Payouts PATCH error:', err)
    return NextResponse.json({ error: 'Failed to process payouts' }, { status: 500 })
  }
}
