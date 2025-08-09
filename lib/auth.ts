import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import type { User, Role } from "@prisma/client"

export interface AuthUser extends User {
  sellerProfile?: any
  artisanProfile?: any
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { userId } = auth()

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        sellerProfile: true,
        artisanProfile: true,
      },
    })

    return user
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Authentication required")
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated")
  }

  return user
}

export async function requireRole(role: Role): Promise<AuthUser> {
  const user = await requireAuth()

  if (user.role !== role) {
    throw new Error(`${role} role required`)
  }

  return user
}

export async function isUserAdmin(clerkId: string): Promise<boolean> {
  try {
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    return adminIds.includes(clerkId)
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

export async function requireAdmin(): Promise<AuthUser> {
  const { userId } = auth()

  if (!userId) {
    throw new Error("Authentication required")
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    throw new Error("Admin access required")
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

export async function checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    })

    if (!user || !user.isActive) {
      return false
    }

    // Admin has all permissions
    if (await isUserAdmin(userId)) {
      return true
    }

    // Add more granular permission logic here
    return true
  } catch (error) {
    console.error("Error checking permissions:", error)
    return false
  }
}
