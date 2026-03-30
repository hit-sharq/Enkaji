/** Pesapal v3 Payment Gateway Integration - FIXED CONFIG */

import crypto from 'crypto'

export interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  baseUrl: string
  callbackUrl: string
  ipnUrl?: string
}

// LIVE PRODUCTION URL
export const pesapalConfig: PesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  baseUrl: process.env.PESAPAL_BASE_URL || 'https://www.pesapal.com/pesapalv3', // LIVE
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`,
  ipnUrl: process.env.PESAPAL_IPN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/ipn`
}

export class PesapalService {
  private config: PesapalConfig
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(config: PesapalConfig) {
    this.config = config
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

    console.log('Pesapal Auth Response:', response.status, response.statusText)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Auth error full response:', errorText)
      const error = await response.json().catch(() => ({ error: errorText }))
      throw new Error(`Pesapal auth failed: ${error.error || response.statusText} - ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()
    this.accessToken = data.token
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)
    
    console.log('Pesapal token obtained:', !!this.accessToken)
    return this.accessToken!
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

    console.log('Pesapal submit headers:', { timestamp, signature: signature.substring(0,50) + '...' })

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

    console.log('Pesapal submit response:', response.status, response.statusText)
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Submit error full:', errorText)
      let error = { error: errorText }
      try {
        error = JSON.parse(errorText)
      } catch {}
      throw new Error(`Pesapal submit failed (${response.status}): ${error.error || errorText.substring(0,200)}`)
    }

    return await response.json()
  }

  // ... rest of methods unchanged
}

// Singleton
export const pesapalService = new PesapalService(pesapalConfig)


