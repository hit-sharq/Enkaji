import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code, orderTotal } = await req.json()
    if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    if (!coupon.isActive) return NextResponse.json({ error: 'This coupon is no longer active' }, { status: 400 })
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 })
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'This coupon has reached its usage limit' }, { status: 400 })
    }
    if (orderTotal && coupon.minimumOrder && parseFloat(orderTotal) < coupon.minimumOrder) {
      return NextResponse.json({
        error: `Minimum order of KES ${coupon.minimumOrder.toLocaleString()} required`,
      }, { status: 400 })
    }

    let discountAmount = 0
    if (coupon.discountType === 'percentage') {
      discountAmount = (parseFloat(orderTotal || '0') * coupon.discountValue) / 100
      if (coupon.maximumDiscount) discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
    } else {
      discountAmount = coupon.discountValue
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id, code: coupon.code, description: coupon.description,
        discountType: coupon.discountType, discountValue: coupon.discountValue,
      },
      discountAmount: Math.round(discountAmount * 100) / 100,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
