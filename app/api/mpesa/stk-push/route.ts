import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { handleApiError, AuthenticationError, ValidationError } from "@/lib/errors"

const MPESA_BASE_URL = process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke"
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || ""
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || ""
const BUSINESS_SHORT_CODE = process.env.MPESA_BUSINESS_SHORT_CODE || "174379"
const PASSKEY = process.env.MPESA_PASSKEY || ""

async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")

  const response = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to get M-Pesa access token")
  }

  const data = await response.json()
  return data.access_token
}

function generateTimestamp(): string {
  const now = new Date()
  return (
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0")
  )
}

function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  const data = shortCode + passkey + timestamp
  return Buffer.from(data).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      throw new AuthenticationError()
    }

    const { phoneNumber, amount, orderId, accountReference } = await request.json()

    if (!phoneNumber || !amount || amount <= 0) {
      throw new ValidationError("Phone number and amount are required")
    }

    // Format phone number (remove leading 0 and add 254)
    const formattedPhone = phoneNumber.startsWith("0")
      ? "254" + phoneNumber.slice(1)
      : phoneNumber.startsWith("254")
        ? phoneNumber
        : "254" + phoneNumber

    const accessToken = await getAccessToken()
    const timestamp = generateTimestamp()
    const password = generatePassword(BUSINESS_SHORT_CODE, PASSKEY, timestamp)

    const stkPushPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/mpesa/callback`,
      AccountReference: accountReference || orderId || "ENKAJI",
      TransactionDesc: "Payment for Enkaji order",
    }

    const response = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushPayload),
    })

    const data = await response.json()

    if (data.ResponseCode === "0") {
      return NextResponse.json({
        success: true,
        message: "STK push sent successfully",
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
      })
    } else {
      throw new Error(data.ResponseDescription || "STK push failed")
    }
  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
