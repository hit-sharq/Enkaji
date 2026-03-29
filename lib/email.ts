import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'Enkaji Trade <noreply@enkaji.co.ke>'

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] No RESEND_API_KEY set, skipping email to', to, subject)
    return
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html })
    if (error) console.error('[Email] Send error:', error)
  } catch (err) {
    console.error('[Email] Unexpected error:', err)
  }
}

export function orderConfirmationEmail(order: {
  orderNumber: string
  total: string
  items: { name: string; qty: number; price: string }[]
  shippingAddress: string
  firstName: string
}) {
  const itemsHtml = order.items
    .map(i => `<tr><td style="padding:8px">${i.name}</td><td style="padding:8px">${i.qty}</td><td style="padding:8px">KES ${i.price}</td></tr>`)
    .join('')
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">Order Confirmed — ${order.orderNumber}</h2>
    <p>Hello ${order.firstName}, thank you for your order!</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0">
      <thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:left">Qty</th><th style="padding:8px;text-align:left">Price</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Total:</strong> KES ${order.total}</p>
    <p><strong>Shipping to:</strong> ${order.shippingAddress}</p>
    <p style="color:#666;font-size:12px">Enkaji Trade Kenya — Connecting Kenya's Market</p>
  </div>`
}

export function deliveryStatusEmail(delivery: {
  deliveryNumber: string
  status: string
  driverName?: string
  customerName: string
}) {
  const statusMessages: Record<string, string> = {
    accepted: 'A driver has accepted your delivery and is on the way.',
    picked_up: 'Your package has been picked up by the driver.',
    delivered: 'Your package has been delivered successfully!',
    cancelled: 'Your delivery has been cancelled.',
  }
  const msg = statusMessages[delivery.status] || `Your delivery status is now: ${delivery.status}`
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">Lumyn Delivery Update — ${delivery.deliveryNumber}</h2>
    <p>Hello ${delivery.customerName},</p>
    <p>${msg}</p>
    ${delivery.driverName ? `<p><strong>Driver:</strong> ${delivery.driverName}</p>` : ''}
    <p style="color:#666;font-size:12px">Lumyn Flow — Fast Delivery in Nairobi</p>
  </div>`
}

export function driverApprovedEmail(driver: { fullName: string }) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">Welcome to Lumyn Flow, ${driver.fullName}!</h2>
    <p>Your driver account has been approved. You can now log in and start accepting deliveries.</p>
    <p>Set yourself as <strong>Available</strong> from the app to start receiving job offers.</p>
    <p style="color:#666;font-size:12px">Lumyn Flow — Fast Delivery in Nairobi</p>
  </div>`
}

export function productApprovalEmail(sellerName: string, approved: boolean, productName: string, reason?: string) {
  const status = approved ? 'APPROVED' : 'REJECTED'
  const color = approved ? '#28a745' : '#dc3545'
  const message = approved 
    ? 'Your product has been approved and is now live on Enkaji!'
    : `Your product submission has been reviewed. Reason: ${reason || 'Needs improvements'}`

  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:${color}">Product ${status} — ${productName}</h2>
    <p>Hi ${sellerName},</p>
    <p>${message}</p>
    ${reason && !approved ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
    <p>Login to <a href="https://enkaji.co.ke/sellers">Enkaji Sellers</a> dashboard to view/manage products.</p>
    <p style="color:#666;font-size:12px">Enkaji Trade Kenya</p>
  </div>`
}

export function bulkOrderNotificationEmail(sellerName: string, bulkOrder: { title: string, totalAmount: number, id: string }) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">New Bulk Order Inquiry #${bulkOrder.id.slice(-6)}</h2>
    <p>Hi ${sellerName},</p>
    <p>You have a new bulk order request for <strong>${bulkOrder.title}</strong></p>
    <p><strong>Total Value:</strong> KES ${bulkOrder.totalAmount.toLocaleString()}</p>
    <p>Login to your <a href="https://enkaji.co.ke/sellers">seller dashboard</a> to review and respond.</p>
    <p style="color:#666;font-size:12px">Enkaji Trade Kenya</p>
  </div>`
}

export function paymentCallbackEmail(
  customerName: string, 
  orderNumber: string, 
  amount: number, 
  status: 'completed' | 'failed',
  method: string
) {
  const icon = status === 'completed' ? '✅' : '❌'
  const title = status === 'completed' ? 'Payment Successful' : 'Payment Failed'
  const color = status === 'completed' ? '#28a745' : '#dc3545'
  const message = status === 'completed' 
    ? `Your payment of KES ${amount.toLocaleString()} was successful!`
    : `Your payment attempt failed. Please try again or contact support.`

  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:${color}">${icon} ${title} — ${orderNumber}</h2>
    <p>Hi ${customerName},</p>
    <p>${message}</p>
    <p><strong>Method:</strong> ${method}</p>
    <p style="color:#666;font-size:12px">Enkaji Trade Kenya — Secure Payments</p>
  </div>`
}
