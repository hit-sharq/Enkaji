"use client"

import type React from "react"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RoleGuardProps {
  children: React.ReactNode
  requiredRole?: string
  requiredPermission?: string
  minimumRole?: string
  fallback?: React.ReactNode
  redirectTo?: string
}

export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  minimumRole,
  fallback,
  redirectTo = "/dashboard",
}: RoleGuardProps) {
  const { user, isLoaded } = useUser()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!isLoaded || !user) {
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        let endpoint = "/api/auth/check-access"
        const params = new URLSearchParams()

        if (requiredRole) params.append("role", requiredRole)
        if (requiredPermission) params.append("permission", requiredPermission)
        if (minimumRole) params.append("minimumRole", minimumRole)

        if (params.toString()) {
          endpoint += `?${params.toString()}`
        }

        const response = await fetch(endpoint)
        const data = await response.json()

        setHasAccess(data.hasAccess || false)
      } catch (error) {
        console.error("Error checking access:", error)
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, isLoaded, requiredRole, requiredPermission, minimumRole])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-md mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <div className="space-y-4">
              <p>You don't have permission to access this page.</p>
              <p className="text-sm text-muted-foreground">
                {requiredRole && `Required role: ${requiredRole}`}
                {requiredPermission && `Required permission: ${requiredPermission}`}
                {minimumRole && `Minimum role: ${minimumRole}`}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={redirectTo}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
