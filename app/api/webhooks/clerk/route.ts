import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable")
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  // Handle the webhook
  const { id } = evt.data
  const eventType = evt.type

  try {
    switch (eventType) {
      case "user.created":
        await prisma.user.create({
          data: {
            clerkId: id!,
            email: evt.data.email_addresses?.[0]?.email_address || "",
            firstName: evt.data.first_name || "",
            lastName: evt.data.last_name || "",
            imageUrl: evt.data.image_url || "",
            role: "BUYER", // Default role
          },
        })
        console.log(`User created: ${id}`)
        break

      case "user.updated":
        await prisma.user.update({
          where: { clerkId: id! },
          data: {
            email: evt.data.email_addresses?.[0]?.email_address || "",
            firstName: evt.data.first_name || "",
            lastName: evt.data.last_name || "",
            imageUrl: evt.data.image_url || "",
          },
        })
        console.log(`User updated: ${id}`)
        break

      case "user.deleted":
        await prisma.user.delete({
          where: { clerkId: id! },
        })
        console.log(`User deleted: ${id}`)
        break

      default:
        console.log(`Unhandled webhook event: ${eventType}`)
    }
  } catch (error) {
    console.error(`Error handling webhook event ${eventType}:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
