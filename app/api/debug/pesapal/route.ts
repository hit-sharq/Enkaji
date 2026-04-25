import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  try {
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY || ''
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || ''
    const env = process.env.PESAPAL_ENVIRONMENT || 'not set'
    
    const baseUrl = env === 'production'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3'
    
    // Test credentials
    const timestamp = new Date().toISOString()
    const message = `POST/api/Auth/RequestToken${timestamp}${consumerKey}`
    const signature = crypto
      .createHmac('sha256', consumerSecret)
      .update(message)
      .digest('base64')
    
    const response = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'pesapal-request-date': timestamp,
        'pesapal-authorization': `Pesapal ${consumerKey}:${signature}`
      }
    })
    
    const responseText = await response.text()
    let data = null
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw: responseText }
    }
    
    return NextResponse.json({
      environment: env,
      baseUrl,
      credentials: {
        keyPresent: !!consumerKey,
        keyLength: consumerKey.length,
        secretPresent: !!consumerSecret,
        secretLength: consumerSecret.length,
        keyPreview: consumerKey.slice(0, 10) + '...',
      },
      httpStatus: response.status,
      response: data,
      requestDetails: {
        timestamp,
        message,
        signaturePreview: signature.slice(0, 20) + '...',
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}

