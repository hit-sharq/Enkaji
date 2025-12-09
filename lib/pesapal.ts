import crypto from 'crypto'

export interface PesapalConfig {
  consumerKey: string
  consumerSecret: string
  baseUrl: string
  callbackUrl: string
}

export class PesapalService {
  private config: PesapalConfig

  constructor(config: PesapalConfig) {
    this.config = config
  }

  private generateSignature(method: string, url: string, timestamp: string, consumerKey: string): string {
    const message = `${method.toUpperCase()}${url}${timestamp}${consumerKey}`
    return crypto.createHmac('sha256', this.config.consumerSecret)
      .update(message)
      .digest('base64')
  }

  private async getAccessToken(): Promise<string> {
    const timestamp = new Date().toISOString()
    const signature = this.generateSignature('GET', '/api/Auth/RequestToken', timestamp, this.config.consumerKey)

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
      throw new Error('Failed to get Pesapal access token')
    }

    const data = await response.json()
    return data.token
  }

  async submitOrder(orderData: {
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
  }): Promise<any> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature('POST', '/api/Transactions/SubmitOrderRequest', timestamp, this.config.consumerKey)

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
      throw new Error(`Pesapal API error: ${response.statusText}`)
    }

    return await response.json()
  }

  async getTransactionStatus(orderTrackingId: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature('GET', `/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, timestamp, this.config.consumerKey)

    const response = await fetch(`${this.config.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`, {
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
      throw new Error(`Pesapal API error: ${response.statusText}`)
    }

    return await response.json()
  }

  async registerIPN(ipnData: {
    url: string
    ipn_notification_type: string
  }): Promise<any> {
    const accessToken = await this.getAccessToken()
    const timestamp = new Date().toISOString()

    const signature = this.generateSignature('POST', '/api/URLSetup/RegisterIPN', timestamp, this.config.consumerKey)

    const response = await fetch(`${this.config.baseUrl}/api/URLSetup/RegisterIPN`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${this.config.consumerKey}:${signature}`,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(ipnData)
    })

    if (!response.ok) {
      throw new Error(`Pesapal API error: ${response.statusText}`)
    }

    return await response.json()
  }
}

// Configuration
export const pesapalConfig: PesapalConfig = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  baseUrl: process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3',
  callbackUrl: process.env.PESAPAL_CALLBACK_URL || `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/callback`
}

export const pesapalService = new PesapalService(pesapalConfig)
