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

    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ coupons })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code, description, discountType, discountValue, minimumOrder, maximumDiscount, usageLimit, expiresAt } = body

    if (!code || !discountValue) {
      return NextResponse.json({ error: 'code and discountValue are required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        description,
        discountType: discountType || 'percentage',
        discountValue: parseFloat(discountValue),
        minimumOrder: minimumOrder ? parseFloat(minimumOrder) : 0,
        maximumDiscount: maximumDiscount ? parseFloat(maximumDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ coupon }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create coupon'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId || !(await isAdmin(userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, isActive } = await req.json()
    const coupon = await prisma.coupon.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ coupon })
  } catch {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}
