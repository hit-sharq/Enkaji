import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { AuthenticationError, AuthorizationError } from "@/lib/errors"

export async function getCurrentUser() {
  try {
    const user = await currentUser()

    if (!user) {
      return null
    }

    let dbUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
      include: {
        sellerProfile: true,
      },
    })

    // If user doesn't exist in database, create them
    if (!dbUser) {
      // Check if user is admin based on environment variable
      const adminIds = process.env.ADMIN_IDS?.split(",") || []
      const isAdminUser = adminIds.includes(user.id)

      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
          role: isAdminUser ? "ADMIN" : "BUYER", // Set role based on admin check
        },
        include: {
          sellerProfile: true,
        },
      })
    }

    return dbUser
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const { userId } = await auth()

  if (!userId) {
    throw new AuthenticationError()
  }

  return userId
}

export async function isAdmin() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    return adminIds.includes(user.clerkId) || user.role === "ADMIN"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function isUserAdmin(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user) return false

    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    return adminIds.includes(user.clerkId) || user.role === "ADMIN"
  } catch (error) {
    console.error("Error checking if user is admin:", error)
    return false
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  const adminIds = process.env.ADMIN_IDS?.split(",") || []
  const isAdminUser = adminIds.includes(user.clerkId) || user.role === "ADMIN"

  if (!isAdminUser) {
    throw new AuthorizationError("Admin access required")
  }

  return user
}

export async function requireRole(requiredRole: "ADMIN" | "ARTISAN" | "SELLER") {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  if (user.role !== requiredRole) {
    throw new AuthorizationError(`${requiredRole} role required`)
  }

  return user
}
