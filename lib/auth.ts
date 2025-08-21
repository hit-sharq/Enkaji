import { currentUser } from "@clerk/nextjs/server"
import type { User } from "@clerk/nextjs/server" // Added Clerk User type import
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AuthenticationError, AuthorizationError } from "@/lib/errors"

// Role hierarchy definition
const ROLE_HIERARCHY = {
  ADMIN: 100,
  FINANCE_MANAGER: 80,
  CONTENT_MANAGER: 70,
  MODERATOR: 60,
  REGIONAL_MANAGER: 50,
  SUPPORT_AGENT: 40,
  SELLER: 30,
  ARTISAN: 20,
  BUYER: 10,
} as const

// Permission definitions for Enkaji platform
const PERMISSIONS = {
  // User management
  "users.view": ["ADMIN", "MODERATOR", "SUPPORT_AGENT"],
  "users.edit": ["ADMIN", "MODERATOR"],
  "users.delete": ["ADMIN"],
  "users.verify": ["ADMIN", "MODERATOR"],

  // Product management
  "products.view": ["ADMIN", "MODERATOR", "CONTENT_MANAGER", "SELLER"],
  "products.edit": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],
  "products.approve": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],
  "products.feature": ["ADMIN", "CONTENT_MANAGER"],
  "products.delete": ["ADMIN"],

  // Artisan management
  "artisans.view": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],
  "artisans.approve": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],
  "artisans.feature": ["ADMIN", "CONTENT_MANAGER"],
  "artisans.edit": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],

  // Order management
  "orders.view": ["ADMIN", "MODERATOR", "SUPPORT_AGENT", "FINANCE_MANAGER"],
  "orders.edit": ["ADMIN", "SUPPORT_AGENT"],
  "orders.cancel": ["ADMIN", "SUPPORT_AGENT"],
  "orders.refund": ["ADMIN", "FINANCE_MANAGER"],

  // Payment management
  "payments.view": ["ADMIN", "FINANCE_MANAGER"],
  "payments.process": ["ADMIN", "FINANCE_MANAGER"],
  "payouts.approve": ["ADMIN", "FINANCE_MANAGER"],
  "payouts.process": ["ADMIN", "FINANCE_MANAGER"],
  "disputes.resolve": ["ADMIN", "FINANCE_MANAGER", "SUPPORT_AGENT"],

  // Content management
  "content.edit": ["ADMIN", "CONTENT_MANAGER"],
  "blog.publish": ["ADMIN", "CONTENT_MANAGER"],
  "blog.edit": ["ADMIN", "CONTENT_MANAGER"],
  "reviews.moderate": ["ADMIN", "MODERATOR", "CONTENT_MANAGER"],

  // Analytics
  "analytics.view": ["ADMIN", "FINANCE_MANAGER", "CONTENT_MANAGER"],
  "analytics.export": ["ADMIN", "FINANCE_MANAGER"],

  // Regional management
  "region.manage": ["ADMIN", "REGIONAL_MANAGER"],
  "region.view": ["ADMIN", "REGIONAL_MANAGER", "MODERATOR"],

  // System settings
  "settings.edit": ["ADMIN"],
  "roles.assign": ["ADMIN"],
} as const

export async function getCurrentUser() {
  try {
    console.log("🔍 Attempting to get current user from Clerk...")

    const user: User | null = await Promise.race([
      currentUser(),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Clerk API timeout")), 3000)),
    ])

    if (!user) {
      console.log("❌ No user found from Clerk")
      return null
    }

    console.log("✅ User found from Clerk:", user.id)

    try {
      let dbUser = await db.user.findUnique({
        where: { clerkId: user.id },
        include: {
          sellerProfile: true,
          artisanProfile: true,
        },
      })

      // If user doesn't exist in database, create them
      if (!dbUser) {
        console.log("🔄 Creating new user in database...")

        const adminIds = process.env.ADMIN_IDS?.split(",") || []
        const isAdminUser = adminIds.includes(user.id)

        dbUser = await db.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses?.[0]?.emailAddress || "",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            imageUrl: user.imageUrl || "",
            role: isAdminUser ? "ADMIN" : "BUYER",
          },
          include: {
            sellerProfile: true,
            artisanProfile: true,
          },
        })

        console.log("✅ User created in database:", dbUser.id)
      } else {
        const adminIds = process.env.ADMIN_IDS?.split(",") || []
        if (adminIds.includes(user.id) && dbUser.role !== "ADMIN") {
          dbUser = await db.user.update({
            where: { id: dbUser.id },
            data: { role: "ADMIN" },
            include: {
              sellerProfile: true,
              artisanProfile: true,
            },
          })
        }
      }

      return dbUser
    } catch (dbError) {
      console.error("❌ Database error:", dbError)
      const adminIds = process.env.ADMIN_IDS?.split(",") || []
      return {
        id: user.id,
        clerkId: user.id,
        email: user.emailAddresses?.[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "",
        role: adminIds.includes(user.id) ? ("ADMIN" as const) : ("BUYER" as const),
        sellerProfile: null,
        artisanProfile: null,
      }
    }
  } catch (error) {
    console.error("❌ Error getting current user:", error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    console.log("🚫 No user found, redirecting to sign-in")
    redirect("/sign-in")
  }

  return user
}

// Check if user is admin (environment variable OR database role)
export async function isAdmin() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return false
    }

    // Check environment variable first (highest priority)
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    if (adminIds.includes(user.clerkId)) {
      return true
    }

    // Check database role
    return user.role === "ADMIN"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Enhanced role checking functions
export async function hasRole(requiredRole: keyof typeof ROLE_HIERARCHY) {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    // Check environment variable for admin (highest priority)
    if (requiredRole === "ADMIN") {
      const adminIds = process.env.ADMIN_IDS?.split(",") || []
      if (adminIds.includes(user.clerkId)) return true
    }

    // Check database role
    return user.role === requiredRole
  } catch (error) {
    console.error("Error checking role:", error)
    return false
  }
}

export async function hasPermission(permission: keyof typeof PERMISSIONS) {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    // Environment admin has all permissions
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    if (adminIds.includes(user.clerkId)) return true

    // Check if user's role has this permission
    const allowedRoles = PERMISSIONS[permission]
    return allowedRoles.includes(user.role as any)
  } catch (error) {
    console.error("Error checking permission:", error)
    return false
  }
}

export async function hasMinimumRole(minimumRole: keyof typeof ROLE_HIERARCHY) {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    // Environment admin has highest role
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    if (adminIds.includes(user.clerkId)) return true

    const userRoleLevel = ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0
    const requiredLevel = ROLE_HIERARCHY[minimumRole]

    return userRoleLevel >= requiredLevel
  } catch (error) {
    console.error("Error checking minimum role:", error)
    return false
  }
}

export async function requireRole(requiredRole: keyof typeof ROLE_HIERARCHY) {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  if (!(await hasRole(requiredRole))) {
    throw new AuthorizationError(`${requiredRole} role required`)
  }

  return user
}

export async function requirePermission(permission: keyof typeof PERMISSIONS) {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  // Environment admin has all permissions
  const adminIds = process.env.ADMIN_IDS?.split(",") || []
  if (adminIds.includes(user.clerkId)) {
    return user
  }

  // Check if user's role has this permission
  const allowedRoles = PERMISSIONS[permission]
  if (!allowedRoles.includes(user.role as any)) {
    throw new AuthorizationError(`Permission ${permission} required`)
  }

  return user
}

export async function requireMinimumRole(minimumRole: keyof typeof ROLE_HIERARCHY) {
  const user = await getCurrentUser()

  if (!user) {
    throw new AuthenticationError()
  }

  if (!(await hasMinimumRole(minimumRole))) {
    throw new AuthorizationError(`Minimum role ${minimumRole} required`)
  }

  return user
}

export async function isUserAdmin(userId: string) {
  try {
    // First check if user is admin based on environment variable
    const adminIds = process.env.ADMIN_IDS?.split(",") || []
    const isAdminByEnv = adminIds.includes(userId)

    // If they're admin by environment, return true immediately
    if (isAdminByEnv) {
      return true
    }

    // Otherwise check database role
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    })

    return user?.role === "ADMIN" || false
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

// Utility function to get user role level
export async function getUserRoleLevel() {
  const user = await getCurrentUser()
  if (!user) return 0

  // Environment admin has highest level
  const adminIds = process.env.ADMIN_IDS?.split(",") || []
  if (adminIds.includes(user.clerkId)) return 100

  return ROLE_HIERARCHY[user.role as keyof typeof ROLE_HIERARCHY] || 0
}

// Function to check if user can manage another user
export async function canManageUser(targetUserId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return false

  // Environment admin can manage anyone
  const adminIds = process.env.ADMIN_IDS?.split(",") || []
  if (adminIds.includes(currentUser.clerkId)) return true

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
  })

  if (!targetUser) return false

  const currentUserLevel = ROLE_HIERARCHY[currentUser.role as keyof typeof ROLE_HIERARCHY] || 0
  const targetUserLevel = ROLE_HIERARCHY[targetUser.role as keyof typeof ROLE_HIERARCHY] || 0

  // Can only manage users with lower role level
  return currentUserLevel > targetUserLevel
}

export async function checkUserRole(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true },
    })

    return user
  } catch (error) {
    console.error("Error checking user role:", error)
    return null
  }
}
