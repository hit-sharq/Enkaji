import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    await requireAdmin()

    return NextResponse.json({
      environment: process.env.PESAPAL_ENVIRONMENT ? "configured" : "missing",
      baseUrl: process.env.PESAPAL_ENVIRONMENT === "production"
        ? "https://pay.pesapal.com/v3"
        : "https://cybqa.pesapal.com/pesapalv3",
      credentials: {
        keyPresent: !!process.env.PESAPAL_CONSUMER_KEY,
        secretPresent: !!process.env.PESAPAL_CONSUMER_SECRET,
      },
      status: "ok",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to check Pesapal configuration" }, { status: 500 })
  }
}
