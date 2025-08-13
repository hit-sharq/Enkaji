"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield } from "lucide-react"

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  createdAt: string
}

interface RoleManagementProps {
  users: User[]
}

const ROLE_COLORS = {
  ADMIN: "bg-red-100 text-red-800",
  MODERATOR: "bg-orange-100 text-orange-800",
  CONTENT_MANAGER: "bg-purple-100 text-purple-800",
  FINANCE_MANAGER: "bg-green-100 text-green-800",
  REGIONAL_MANAGER: "bg-blue-100 text-blue-800",
  SUPPORT_AGENT: "bg-yellow-100 text-yellow-800",
  SELLER: "bg-indigo-100 text-indigo-800",
  ARTISAN: "bg-pink-100 text-pink-800",
  BUYER: "bg-gray-100 text-gray-800",
}

const ROLE_DESCRIPTIONS = {
  ADMIN: "Full system access and user management",
  MODERATOR: "Content moderation and user oversight",
  CONTENT_MANAGER: "Blog, artisan profiles, and content management",
  FINANCE_MANAGER: "Payment processing and financial operations",
  REGIONAL_MANAGER: "Regional operations and local management",
  SUPPORT_AGENT: "Customer support and order assistance",
  SELLER: "Product selling and store management",
  ARTISAN: "Craft creation and artisan profile",
  BUYER: "Standard user with purchasing capabilities",
}

export function RoleManagement({ users }: RoleManagementProps) {
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleRoleChange = async (userId: string, newRole: string) => {
    setLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      const response = await fetch(`/api/admin/users/${userId}/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        throw new Error("Failed to assign role")
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      })

      // Refresh the page to show updated roles
      window.location.reload()
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Role Management</h2>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800"}>
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS]}
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedRoles[user.id] || user.role}
                    onValueChange={(value) => setSelectedRoles((prev) => ({ ...prev, [user.id]: value }))}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUYER">Buyer</SelectItem>
                      <SelectItem value="SELLER">Seller</SelectItem>
                      <SelectItem value="ARTISAN">Artisan</SelectItem>
                      <SelectItem value="SUPPORT_AGENT">Support Agent</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                      <SelectItem value="CONTENT_MANAGER">Content Manager</SelectItem>
                      <SelectItem value="FINANCE_MANAGER">Finance Manager</SelectItem>
                      <SelectItem value="REGIONAL_MANAGER">Regional Manager</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleRoleChange(user.id, selectedRoles[user.id] || user.role)}
                    disabled={loading[user.id] || !selectedRoles[user.id] || selectedRoles[user.id] === user.role}
                    size="sm"
                  >
                    {loading[user.id] ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
