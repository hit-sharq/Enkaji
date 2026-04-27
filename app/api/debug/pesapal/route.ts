import { NextResponse } from "next/server"

export async function GET() {
  try {
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY || ''
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET || ''
    const env = process.env.PESAPAL_ENVIRONMENT || 'not set'
    
    const baseUrl = env === 'production'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/pesapalv3'
    
    // Test credentials using Pesapal V3 body-based auth
    const response = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret
      })
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
        bodySent: {
          consumer_key: consumerKey.slice(0, 10) + '...',
          consumer_secret_present: !!consumerSecret
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 })
  }
}
