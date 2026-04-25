/** Pesapal v3 Payment Gateway Integration */

import crypto from 'crypto'

export interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  baseUrl: string
  callbackUrl: string
  ipnUrl?: string
}

// Determine environment from env var (default to sandbox for safety)
const isProduction = process.env.PESAPAL_ENVIRONMENT === 'production'

// Correct URLs based on Pesapal official documentation
export const pesapalConfig: PesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  baseUrl: isProduction
    ? 'https://pay.pesapal.com/v3'  // Production/Live
    : 'https://cybqa.pesapal.com/pesapalv3', // Sandbox/Demo
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
  // IPN uses the same endpoint as callback (POST handler)
  ipnUrl: process.env.PESAPAL_IPN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`
}

export class PesapalService {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null
  private ipnId: string = ''

  constructor(config: PesapalConfig) {
    this.config = config
    // Load IPN ID from environment if available
    this.ipnId = process.env.PESAPAL_IPN_ID || ''
  }

  private validateCredentials(): void {
    if (!this.config.consumerKey || this.config.consumerKey.trim() === '') {
      throw new Error(
        'Pesapal credentials not configured. PESAPAL_CONSUMER_KEY is missing or empty. ' +
        'Please check your .env file and ensure PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are set.'
      )
    }
    if (!this.config.consumerSecret || this.config.consumerSecret.trim() === '') {
      throw new Error(
        'Pesapal credentials not configured. PESAPAL_CONSUMER_SECRET is missing or empty. ' +
        'Please check your .env file and ensure PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET are set.'
      )
    }
  }

  private generateSignature(method: string, url: string, timestamp: string, consumerKey: string): string {
    const message = `${method.toUpperCase()}${url}${timestamp}${consumerKey}`
    return crypto
      .createHmac('sha256', this.config.consumerSecret)
      .update(message)
      .digest('base64')
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken
    }

    // Validate credentials before making request
    this.validateCredentials()

    const isProduction = this.config.baseUrl.includes('pay.pesapal.com')
    console.log(`[Pesapal] Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`)
    console.log(`[Pesapal] Base URL: ${this.config.baseUrl}`)
    console.log(`[Pesapal] Consumer Key present: ${!!this.config.consumerKey}`)

    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(
      'POST',
      '/api/Auth/RequestToken',
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`
      }
    })

    const responseText = await response.text()
    console.log('Pesapal Auth Response:', response.status, response.statusText)
    console.log('Pesapal Auth body:', responseText.substring(0, 500))

    if (!response.ok) {
      throw new Error(`Pesapal auth failed (${response.status}): ${responseText.substring(0,200)}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`Pesapal auth failed: Invalid JSON response`)
    }

    // Check if Pesapal returned an error object instead of token
    if (data.error || data.status === 'error' || data.status === 'failed') {
      const errorMsg = data.error || data.message || data.status_description || JSON.stringify(data)
      console.error('Pesapal auth returned error object:', data)
      throw new Error(
        `Pesapal auth failed: ${errorMsg}. ` +
        `This usually means your Consumer Key/Secret is invalid or the credentials are not registered for this environment (${isProduction ? 'production' : 'sandbox'}).`
      )
    }

    const token = data.token || data.access_token || data.accessToken || data.AccessToken
    if (!token) {
      console.error('Pesapal auth response keys:', Object.keys(data))
      throw new Error(`Pesapal auth failed: No token found. Keys: ${Object.keys(data).join(', ')}`)
    }

    this.accessToken = token
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000) // Token valid for ~55 minutes

    console.log('Pesapal token obtained successfully')
    return token
  }

  async registerIPN(url: string): Promise<string> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()
    const signature = this.generateSignature(
      'POST',
      '/api/URLSetup/RegisterIPN',
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(`${this.config.baseUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        url,
        ipn_notification_type: 'POST'
      })
    })

    const responseText = await response.text()
    console.log('Pesapal IPN Register Response:', response.status, responseText.substring(0, 300))

    if (!response.ok) {
      throw new Error(`IPN registration failed (${response.status}): ${responseText.substring(0,200)}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`IPN registration failed: Invalid JSON: ${responseText.substring(0,200)}`)
    }

    const ipnId = data.ipn_id || data.ipnId || data.notification_id || data.notificationId
    if (ipnId) {
      this.ipnId = ipnId
      console.log('Pesapal IPN registered, ID:', ipnId)
    } else {
      console.warn('Pesapal IPN response lacks ipn_id:', JSON.stringify(data).substring(0, 200))
    }
    return ipnId || ''
  }

  getIPNId(): string {
    return this.ipnId
  }

  async submitOrder(orderData: any): Promise<any> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature(
      'POST',
      '/api/Transactions/SubmitOrderRequest',
      timestamp,
      this.config.consumerKey
    )

    // Ensure required notification_id is present
    if (!orderData.notification_id && !this.ipnId) {
      // Try to register IPN on the fly
      try {
        const ipnUrl = this.config.ipnUrl || this.config.callbackUrl
        console.log('No IPN ID available, attempting to register IPN:', ipnUrl)
        await this.registerIPN(ipnUrl)
      } catch (err) {
        console.error('Failed to auto-register IPN:', err)
        throw new Error('notification_id is required. Please register IPN first.')
      }
    }

    const payload = {
      ...orderData,
      notification_id: orderData.notification_id || this.ipnId
    }

    console.log('Submitting to Pesapal:', JSON.stringify(payload).substring(0, 300))

    const response = await fetch(`${this.config.baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(payload)
    })

    const responseText = await response.text()
    console.log('Pesapal submit response:', response.status, responseText.substring(0, 200))

    if (!response.ok) {
      let error: any = { error: responseText }
      try {
        if (responseText.trim()) {
          error = JSON.parse(responseText)
        }
      } catch {}
      throw new Error(`Pesapal submit failed (${response.status}): ${error.error || error.message || responseText.substring(0,200)}`)
    }

    if (!responseText.trim()) {
      throw new Error('Pesapal submit returned empty response')
    }

    try {
      return JSON.parse(responseText)
    } catch {
      throw new Error(`Invalid JSON response from Pesapal: ${responseText.substring(0, 200)}`)
    }
  }

  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature(
      'GET',
      `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      timestamp,
      this.config.consumerKey
    )

    const response = await fetch(
      `${this.config.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'pesapal-request-date': timestamp,
          'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    const responseText = await response.text()
    console.log('Pesapal get status response:', response.status, responseText.substring(0, 200))

    if (!response.ok) {
      let error: any = { error: responseText }
      try {
        error = JSON.parse(responseText)
      } catch {}
      throw new Error(`Pesapal get status failed (${response.status}): ${error.error || error.message || responseText.substring(0,200)}`)
    }

    return JSON.parse(responseText)
  }
}

// Singleton
export const pesapalService = new PesapalService(pesapalConfig)
