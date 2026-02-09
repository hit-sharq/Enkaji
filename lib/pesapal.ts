/**
 * Pesapal v3 Payment Gateway Integration
 * Complete implementation with refunds, IPN, and M-Pesa support
 */

import crypto from 'crypto'

// ============================================================================
// Type Definitions
// ============================================================================

export interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  baseUrl: string
  callbackUrl: string
  ipnUrl?: string
}

export interface PesapalOrderData {
  id: string
  currency: string
  amount: number
  description: string
  callback_url: string
  notification_id: string
  billing_address: {
    email_address: string
    phone_number: string
    country_code: string
    first_name: string
    middle_name?: string
    last_name: string
    line_1: string
    line_2?: string
    city: string
    state: string
    postal_code?: string
    zip_code?: string
  }
}

export interface PesapalOrderResponse {
  order_tracking_id: string
  merchant_reference: string
  redirect_url: string
  error?: string
  message?: string
}

export interface PesapalTransactionStatus {
  order_tracking_id: string
  payment_method: string
  payment_status: string
  payment_status_code: number
  payment_status_description: string
  amount: number
  currency: string
  created_date: string
  modified_date: string
  payer: {
    email_address: string
    phone_number: string
    name: string
  }
}

export interface PesapalRefundData {
  orderTrackingId: string
  amount: number
  reason: string
  refundMethod: 'ORIGINAL' | 'BANK' | 'MPESA'
}

export interface PesapalRefundResponse {
  refund_tracking_id: string
  status: string
  status_code: number
  message: string
}

export interface PesapalIPNRegistration {
  url: string
  ipn_notification_type: 'GET' | 'POST'
}

export interface PesapalIPNResponse {
  ipn_id: string
  url: string
  notification_type: string
}

export interface PesapalError {
  error: string
  code?: string
  message?: string
}

// ============================================================================
// Pesapal Service Class
// ============================================================================

export class PesapalService {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: PesapalConfig) {
    this.config = config
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  /**
   * Generate OAuth signature for Pesapal API requests
   */
  private generateSignature(method: string, url: string, timestamp: string, consumerKey: string): string {
    const message = `${method.toUpperCase()}${url}${timestamp}${consumerKey}`
    return crypto
      .createHmac('sha256', this.config.consumerSecret)
      .update(message)
      .digest('base64')
  }

  /**
   * Get access token from Pesapal
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(
      'GET',
      '/api/Auth/RequestToken',
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}/api/Auth/RequestToken`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`
      }
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Failed to get Pesapal access token: ${error.error || response.statusText}`)
    }

    const data = await response.json()
    this.accessToken = data.token
    // Token is typically valid for 1 hour, set expiry to 55 minutes
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)
    
    return this.accessToken!
  }

  // ============================================================================
  // Order Management
  // ============================================================================

  /**
   * Submit an order to Pesapal for payment
   */
  async submitOrder(orderData: PesapalOrderData): Promise<PesapalOrderResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature(
      'POST',
      '/api/Transactions/SubmitOrderRequest',
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(orderData)
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Pesapal order submission failed: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get transaction status from Pesapal
   */
  async getTransactionStatus(orderTrackingId: string): Promise<PesapalTransactionStatus> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`
    const signature = this.generateSignature(
      'GET',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Failed to get transaction status: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionDetails(orderTrackingId: string): Promise<PesapalTransactionStatus> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = `/api/Transactions/GetTransactionDetails?orderTrackingId=${orderTrackingId}`
    const signature = this.generateSignature(
      'GET',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Failed to get transaction details: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  // ============================================================================
  // Refund Processing
  // ============================================================================

  /**
   * Process a refund for a transaction
   */
  async refundTransaction(refundData: PesapalRefundData): Promise<PesapalRefundResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = '/api/Transactions/RefundRequest'
    const signature = this.generateSignature(
      'POST',
      url,
      timestamp,
      this.config.consumerKey
    )

    const requestBody = {
      order_tracking_id: refundData.orderTrackingId,
      amount: refundData.amount,
      refund_method: refundData.refundMethod,
      reason: refundData.reason
    }

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Refund failed: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Check refund status
   */
  async getRefundStatus(refundTrackingId: string): Promise<PesapalRefundResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = `/api/Transactions/GetRefundStatus?refundTrackingId=${refundTrackingId}`
    const signature = this.generateSignature(
      'GET',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Failed to get refund status: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  // ============================================================================
  // IPN Registration
  // ============================================================================

  /**
   * Register an IPN (Instant Payment Notification) endpoint
   */
  async registerIPN(ipnData: PesapalIPNRegistration): Promise<PesapalIPNResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = '/api/URLSetup/RegisterIPN'
    const signature = this.generateSignature(
      'POST',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url: ipnData.url,
        ipn_notification_type: ipnData.ipn_notification_type
      })
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`IPN registration failed: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Get list of registered IPN endpoints
   */
  async getRegisteredIPNs(): Promise<{ ipns: PesapalIPNResponse[] }> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = '/api/URLSetup/GetAllIPNEndpoints'
    const signature = this.generateSignature(
      'GET',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`Failed to get IPN list: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  // ============================================================================
  // M-Pesa Integration
  // ============================================================================

  /**
   * Register M-Pesa callback URLs
   */
  async registerMpesaCallBack(endpoints: {
    validationUrl: string
    confirmationUrl: string
  }): Promise<{ success: boolean }> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const url = '/api/Merchant/RegisterMpesaUrllib'
    const signature = this.generateSignature(
      'POST',
      url,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        validation_url: endpoints.validationUrl,
        confirmation_url: endpoints.confirmationUrl
      })
    })

    if (!response.ok) {
      const error = await response.json() as PesapalError
      throw new Error(`M-Pesa registration failed: ${error.error || response.statusText}`)
    }

    return await response.json()
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Reset access token (useful for testing or mode switching)
   */
  resetToken(): void {
    this.accessToken = null
    this.tokenExpiry = null
  }

  /**
   * Check if running in demo mode
   */
  isDemoMode(): boolean {
    return this.config.baseUrl.includes('cybqa') || 
           this.config.baseUrl.includes('demo') ||
           this.config.baseUrl.includes('sandbox')
  }
}

// ============================================================================
// Configuration & Export
// ============================================================================

export const pesapalConfig: PesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  baseUrl: process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3',
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
  ipnUrl: process.env.PESAPAL_IPN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/ipn`
}

// Export singleton service instance
export const pesapalService = new PesapalService(pesapalConfig)

// Export helper functions
export {
  calculatePesapalSignature,
  verifyPesapalSignature,
  formatPesapalAmount
} from './pesapal-helpers'

