import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"

export async function getCurrentUser() {
  try {
    const user = await currentUser()

    if (!user) {
      return null
    }

    const dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    })

    return dbUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return userId
}

export async function isAdmin() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    // Check if user is admin
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    return adminIds.includes(user.clerkId) || user.role === "ADMIN"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
