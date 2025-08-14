"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, User, Database, Shield, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface UserInfo {
  clerk: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  database: {
    id: string
    clerkId: string
    email: string
    firstName: string | null
    lastName: string | null
    role: string
  } | null
  adminStatus: {
    isEnvAdmin: boolean
    isDatabaseAdmin: boolean
    adminIds: string
  }
  instructions: {
    toMakeAdmin: string
    example: string
  }
}

export function UserInfo() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/debug/user-info")
      if (response.ok) {
        const data = await response.json()
        setUserInfo(data)
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading user information...</div>
        </CardContent>
      </Card>
    )
  }

  if (!userInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-600">Failed to load user information</div>
        </CardContent>
      </Card>
    )
  }

  const isAdmin = userInfo.adminStatus.isEnvAdmin || userInfo.adminStatus.isDatabaseAdmin

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Clerk Authentication Info
          </CardTitle>
          <CardDescription>Your Clerk user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Clerk User ID</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">{userInfo.clerk.id}</code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(userInfo.clerk.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{userInfo.clerk.email}</code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">First Name</label>
              <div className="mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{userInfo.clerk.firstName || "Not set"}</code>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Name</label>
              <div className="mt-1">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">{userInfo.clerk.lastName || "Not set"}</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database User Info
          </CardTitle>
          <CardDescription>Your user record in the database</CardDescription>
        </CardHeader>
        <CardContent>
          {userInfo.database ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Database ID</label>
                <div className="mt-1">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">{userInfo.database.id}</code>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Role</label>
                <div className="mt-1">
                  <Badge variant={userInfo.database.role === "ADMIN" ? "destructive" : "secondary"}>
                    {userInfo.database.role}
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-yellow-600">No database record found</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Status
          </CardTitle>
          <CardDescription>Your current admin permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Overall Admin Status:</span>
            <Badge variant={isAdmin ? "destructive" : "secondary"}>{isAdmin ? "ADMIN" : "NOT ADMIN"}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Environment Admin:</span>
            <Badge variant={userInfo.adminStatus.isEnvAdmin ? "destructive" : "secondary"}>
              {userInfo.adminStatus.isEnvAdmin ? "YES" : "NO"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Database Admin:</span>
            <Badge variant={userInfo.adminStatus.isDatabaseAdmin ? "destructive" : "secondary"}>
              {userInfo.adminStatus.isDatabaseAdmin ? "YES" : "NO"}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">{userInfo.adminStatus.adminIds}</div>
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Info className="h-5 w-5" />
              How to Become Admin
            </CardTitle>
            <CardDescription className="text-orange-700">
              Follow these steps to grant yourself admin access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-orange-800">1. Add this to your .env file:</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-orange-100 px-2 py-1 rounded text-sm flex-1 text-orange-900">
                  {userInfo.instructions.example}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(userInfo.instructions.example)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-orange-700">2. Restart your development server</div>
            <div className="text-sm text-orange-700">3. Refresh this page to verify admin access</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
