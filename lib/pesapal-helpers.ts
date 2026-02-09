/**
 * Pesapal Helper Functions
 * Utility functions for signature generation, validation, and formatting
 */

import crypto from 'crypto'

/**
 * Calculate Pesapal OAuth signature
 */
export function calculatePesapalSignature(
  method: string,
  url: string,
  timestamp: string,
  consumerKey: string,
  consumerSecret: string
): string {
  const message = `${method.toUpperCase()}${url}${timestamp}${consumerKey}`
  return crypto
    .createHmac('sha256', consumerSecret)
    .update(message)
    .digest('base64')
}

/**
 * Verify Pesapal callback signature
 */
export function verifyPesapalSignature(
  method: string,
  url: string,
  timestamp: string,
  consumerKey: string,
  consumerSecret: string,
  providedSignature: string
): boolean {
  const expectedSignature = calculatePesapalSignature(
    method,
    url,
    timestamp,
    consumerKey,
    consumerSecret
  )
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(providedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Format amount for Pesapal (ensure proper decimal places)
 */
export function formatPesapalAmount(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toFixed(2)
}

/**
 * Generate a unique order reference
 */
export function generateOrderReference(prefix: string = 'ORD'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Generate a tracking number
 */
export function generateTrackingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `PES${timestamp}${random}`
}

/**
 * Validate Pesapal response status
 */
export function isPaymentSuccessful(statusCode: number | string): boolean {
  // Status code 1 = Completed/Paid
  // Status code 0 = Failed/Cancelled
  // Status code 2 = Pending
  return statusCode === 1 || statusCode === '1'
}

/**
 * Validate payment method
 */
export function isValidPaymentMethod(method: string): boolean {
  const validMethods = [
    'CARD',
    'MPESA',
    'AIRTEL_MONEY',
    'EQUITY_BANK',
    'KCB_BANK',
    'BANK_TRANSFER',
    'MOBILE_BANKING'
  ]
  return validMethods.includes(method.toUpperCase())
}

/**
 * Get status description from status code
 */
export function getStatusDescription(statusCode: number): string {
  const descriptions: Record<number, string> = {
    0: 'Failed/Cancelled',
    1: 'Completed/Paid',
    2: 'Pending',
    3: 'Invalid',
    4: 'Reversed'
  }
  return descriptions[statusCode] || 'Unknown'
}

/**
 * Calculate refund amount with fees
 */
export function calculateRefundAmount(
  originalAmount: number,
  refundPercentage: number = 100
): { refundAmount: number; platformFee: number } {
  const refund = originalAmount * (refundPercentage / 100)
  // Typically 2.5% fee on refunds
  const platformFee = refund * 0.025
  return {
    refundAmount: refund - platformFee,
    platformFee
  }
}

/**
 * Build Pesapal billing address from order
 */
export function buildBillingAddress(order: {
  email: string
  phone: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}) {
  return {
    email_address: order.email,
    phone_number: order.phone,
    country_code: getCountryCode(order.country),
    first_name: order.firstName,
    last_name: order.lastName,
    line_1: order.address,
    line_2: '',
    city: order.city,
    state: order.state,
    postal_code: order.zipCode,
    zip_code: order.zipCode
  }
}

/**
 * Get ISO country code from country name
 */
function getCountryCode(countryName: string): string {
  const countryCodes: Record<string, string> = {
    'Kenya': 'KE',
    'Uganda': 'UG',
    'Tanzania': 'TZ',
    'Rwanda': 'RW',
    'Nigeria': 'NG',
    'South Africa': 'ZA',
    'Ghana': 'GH',
    'Ethiopia': 'ET',
    'Egypt': 'EG',
    'Morocco': 'MA',
    'United States': 'US',
    'United Kingdom': 'GB',
    'Canada': 'CA',
    'Australia': 'AU',
    'Germany': 'DE',
    'France': 'FR'
  }
  
  return countryCodes[countryName] || countryCodes['Kenya'] || 'KE'
}

/**
 * Parse Pesapal callback data
 */
export function parseCallbackData(body: Record<string, any>): {
  orderTrackingId: string
  merchantReference: string
  status: string
  statusCode: number
  statusDescription: string
  transactionId: string
  paymentMethod: string
  amount: number
  currency: string
} {
  return {
    orderTrackingId: body.OrderTrackingId || body.order_tracking_id || '',
    merchantReference: body.OrderMerchantReference || body.merchant_reference || '',
    status: body.status || '',
    statusCode: parseInt(body.status) || parseInt(body.payment_status_code) || 2,
    statusDescription: body.status_description || body.payment_status_description || '',
    transactionId: body.pesapal_transaction_tracking_id || body.transaction_id || '',
    paymentMethod: body.payment_method || 'CARD',
    amount: parseFloat(body.amount) || 0,
    currency: body.currency || 'KES'
  }
}

/**
 * Format date for Pesapal API
 */
export function formatDateForPesapal(date: Date): string {
  return date.toISOString()
}

/**
 * Validate callback timestamp (prevent replay attacks)
 */
export function isCallbackTimestampValid(timestamp: string, maxAgeSeconds: number = 300): boolean {
  try {
    const callbackTime = new Date(timestamp)
    const now = new Date()
    const ageInSeconds = (now.getTime() - callbackTime.getTime()) / 1000
    return ageInSeconds >= 0 && ageInSeconds <= maxAgeSeconds
  } catch {
    return false
  }
}

/**
 * Log Pesapal API interaction
 */
export function logPesapalInteraction(
  action: string,
  request: { url: string; method: string; body?: any },
  response?: { status: number; data?: any },
  error?: Error
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    request,
    response,
    error: error?.message
  }
  
  console.log('[Pesapal]', JSON.stringify(logEntry, null, 2))
}

/**
 * Create Pesapal order data structure
 */
export function createPesapalOrderData(params: {
  orderId: string
  orderNumber: string
  amount: number
  currency: string
  description: string
  callbackUrl: string
  billingAddress: {
    email_address: string
    phone_number: string
    country_code: string
    first_name: string
    last_name: string
    line_1: string
    city: string
    state: string
    postal_code: string
    zip_code: string
  }
}): Record<string, any> {
  return {
    id: params.orderId,
    currency: params.currency,
    amount: params.amount,
    description: params.description,
    callback_url: params.callbackUrl,
    notification_id: params.orderId,
    billing_address: params.billingAddress
  }
}

