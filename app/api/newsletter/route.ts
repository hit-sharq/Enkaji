import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const existingSubscription = await db.newsletter.findUnique({
      where: { email },
    })

    if (existingSubscription) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 200 })
    }

    await db.newsletter.create({
      data: { email },
    })

    return NextResponse.json({ message: "Successfully subscribed" })
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
