import { NextRequest, NextResponse } from 'next/server'
import { pesapalService } from '@/lib/pesapal'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { appConfig } from '@/lib/app-config'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { orderId, currency = 'KES' } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: user.id },
      select: { 
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        shippingAddress: true 
      }
    })

    if (!order || order.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order not found or not pending' }, { status: 404 })
    }

    const shippingAddr = typeof order.shippingAddress === 'string' ? JSON.parse(order.shippingAddress) : order.shippingAddress

    const orderData: any = {
      id: order.orderNumber,
      currency,
      amount: Number(order.total).toFixed(2),
      description: `Order #${order.orderNumber} — ${appConfig.APP_NAME}`,
      callback_url: `${appConfig.APP_URL}/api/pesapal/callback`,
      notification_id: order.id,
      billing_address: {
        email_address: user.email,
        phone_number: user.phone || '',
        country_code: 'KE',
        first_name: user.firstName || 'Customer',
        middle_name: '',
        last_name: user.lastName || 'Customer',
        line_1: shippingAddr?.address1 || shippingAddr?.line_1 || 'Nairobi',
        line_2: shippingAddr?.address2 || shippingAddr?.line_2 || '',
        city: shippingAddr?.city || 'Nairobi',
        state: shippingAddr?.state || 'Nairobi',
        postal_code: shippingAddr?.postalCode || shippingAddr?.zip_code || '00100',
        zip_code: shippingAddr?.zipCode || shippingAddr?.postalCode || '00100'
      }
    }

    const response = await pesapalService.submitOrder(orderData)

    // Save Pesapal tracking ID
    await prisma.pesapalPayment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        amount: order.total,
        currency,
        pesapalTrackingId: response.order_tracking_id,
        pesapalMerchantRef: response.merchant_reference,
        status: 'PENDING'
      }
    })

    return NextResponse.json(response)

  }
  catch (error: any) {
    console.error('Error submitting Pesapal order:', error)
    return NextResponse.json({ error: error.message || 'Failed to submit order' }, { status: 500 })
  }
}
