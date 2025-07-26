import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

export async function getCurrentUser() {
  const { userId } = auth()

  if (!userId) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        sellerProfile: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export async function requireRole(role: "BUYER" | "SELLER" | "ADMIN") {
  const user = await requireAuth()

  if (user.role !== role) {
    throw new Error(`${role} role required`)
  }

  return user
}
