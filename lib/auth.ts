import { auth } from "@clerk/nextjs/server"
import { db } from "./db"

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) return null

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      artisanProfile: true,
    },
  })

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireRole(role: "ADMIN" | "ARTISAN" | "BUYER") {
  const user = await requireAuth()
  if (user.role !== role) throw new Error("Insufficient permissions")
  return user
}
