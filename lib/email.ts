import { Resend } from 'resend'
import { appConfig } from './app-config'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = appConfig.EMAIL_FROM

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
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME} — ${appConfig.APP_TAGLINE}</p>
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
    <h2 style="color:#8B2635">Delivery Update — ${delivery.deliveryNumber}</h2>
    <p>Hello ${delivery.customerName},</p>
    <p>${msg}</p>
    ${delivery.driverName ? `<p><strong>Driver:</strong> ${delivery.driverName}</p>` : ''}
    <p style="color:#666;font-size:12px">${appConfig.APP_NAME} — ${appConfig.APP_TAGLINE}</p>
  </div>`
}

export function driverApprovedEmail(driver: { fullName: string }) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">Welcome to ${appConfig.APP_NAME}, ${driver.fullName}!</h2>
    <p>Your driver account has been approved. You can now log in and start accepting deliveries.</p>
    <p>Set yourself as <strong>Available</strong> from the app to start receiving job offers.</p>
    <p style="color:#666;font-size:12px">${appConfig.APP_NAME} — ${appConfig.APP_TAGLINE}</p>
  </div>`
}

export function productApprovalEmail(sellerName: string, approved: boolean, productName: string, reason?: string) {
  const status = approved ? 'APPROVED' : 'REJECTED'
  const color = approved ? '#28a745' : '#dc3545'
  const message = approved 
    ? `Your product has been approved and is now live on ${appConfig.APP_NAME}!`
    : `Your product submission has been reviewed. Reason: ${reason || 'Needs improvements'}`

  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:${color}">Product ${status} — ${productName}</h2>
    <p>Hi ${sellerName},</p>
    <p>${message}</p>
    ${reason && !approved ? `<p><strong>Feedback:</strong> ${reason}</p>` : ''}
    <p>Login to <a href="${appConfig.SELLERS_URL}">${appConfig.APP_NAME} Sellers</a> dashboard to view/manage products.</p>
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME}</p>
  </div>`
}

export function sellerVerifiedEmail(sellerName: string, businessName: string) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#28a745">✅ Congratulations, ${sellerName}!</h2>
    <p>Your seller account for <strong>${businessName}</strong> has been verified and approved!</p>
    
    <div style="background:#d4edda;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #28a745">
      <p style="margin:0"><strong>You can now:</strong></p>
      <ul style="margin:8px 0 0 0;padding-left:20px">
        <li>List and sell products on ${appConfig.APP_NAME}</li>
        <li>Receive orders from customers</li>
        <li>Get paid for your sales</li>
        <li>Access seller analytics and insights</li>
      </ul>
    </div>
    
    <p><a href="${appConfig.SELLER_DASHBOARD_URL}" style="display:inline-block;background:#28a745;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Start Selling</a></p>
    
    <p>Welcome to the ${appConfig.APP_NAME} seller community!</p>
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME} — ${appConfig.APP_TAGLINE}</p>
  </div>`
}

export function bulkOrderNotificationEmail(sellerName: string, bulkOrder: { title: string, totalAmount: number, id: string }) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">New Bulk Order Inquiry #${bulkOrder.id.slice(-6)}</h2>
    <p>Hi ${sellerName},</p>
    <p>You have a new bulk order request for <strong>${bulkOrder.title}</strong></p>
    <p><strong>Total Value:</strong> KES ${bulkOrder.totalAmount.toLocaleString()}</p>
    <p>Login to your <a href="${appConfig.SELLERS_URL}">seller dashboard</a> to review and respond.</p>
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME}</p>
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
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME} — Secure Payments</p>
  </div>`
}

export function sellerRegistrationEmail(sellerName: string, businessName: string) {
  return `
  <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
    <h2 style="color:#8B2635">🎉 Welcome to ${appConfig.APP_NAME}, ${sellerName}!</h2>
    <p>Your seller account for <strong>${businessName}</strong> has been created successfully.</p>
    
    <h3 style="color:#333;margin-top:24px">Next Steps: Legal Verification</h3>
    <p>To complete your seller verification and start selling on ${appConfig.APP_NAME}, please provide the following documents:</p>
    
    <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0">
      <h4 style="margin:0 0 12px 0;color:#8B2635">Required Documents:</h4>
      <ul style="margin:0;padding-left:20px">
        <li style="margin-bottom:8px"><strong>Business Registration Certificate</strong> — Proof your business exists</li>
        <li style="margin-bottom:8px"><strong>KRA PIN Certificate</strong> — For tax and payment processing</li>
        <li style="margin-bottom:8px"><strong>CR12 Form</strong> — List of company directors/owners</li>
        <li style="margin-bottom:8px"><strong>Director's ID/Passport</strong> — To verify the person in charge</li>
      </ul>
    </div>
    
    <p>You can upload these documents from your <a href="${appConfig.SELLER_DASHBOARD_URL}">seller dashboard</a> under the "Legal Verification" section.</p>
    
    <h3 style="color:#333;margin-top:24px">While You Wait</h3>
    <p>You can start preparing your store:</p>
    <ul>
      <li>Complete your business profile</li>
      <li>Add your first products</li>
      <li>Set up your payment preferences</li>
    </ul>
    
    <p><a href="${appConfig.SELLER_DASHBOARD_URL}" style="display:inline-block;background:#8B2635;color:white;padding:12px 24px;text-decoration:none;border-radius:4px;margin:16px 0">Go to Dashboard</a></p>
    
    <p>If you have any questions, contact us at <a href="mailto:${appConfig.SUPPORT_EMAIL}">${appConfig.SUPPORT_EMAIL}</a></p>
    <p style="color:#666;font-size:12px">${appConfig.APP_FULL_NAME} — ${appConfig.APP_TAGLINE}</p>
  </div>`
}
