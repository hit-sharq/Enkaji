import { type NextRequest, NextResponse } from "next/server"
import { hasRole, hasPermission, hasMinimumRole } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requiredRole = searchParams.get("role")
    const requiredPermission = searchParams.get("permission")
    const minimumRole = searchParams.get("minimumRole")

    let hasAccess = false

    if (requiredRole) {
      hasAccess = await hasRole(requiredRole as any)
    } else if (requiredPermission) {
      hasAccess = await hasPermission(requiredPermission as any)
    } else if (minimumRole) {
      hasAccess = await hasMinimumRole(minimumRole as any)
    }

    return NextResponse.json({ hasAccess })
  } catch (error) {
    console.error("Error checking access:", error)
    return NextResponse.json({ hasAccess: false }, { status: 500 })
  }
}
