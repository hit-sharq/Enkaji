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
    console.log("Attempting to change role for user:", userId, "to:", newRole)
    setLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      const response = await fetch(`/api/admin/users/${userId}/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()
      console.log("API Response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign role")
      }

      toast({
        title: "Role Updated Successfully",
        description: `User role has been updated to ${newRole}`,
      })

      // Clear the selected role for this user
      setSelectedRoles((prev) => {
        const updated = { ...prev }
        delete updated[userId]
        return updated
      })

      // Refresh the page to show updated roles
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleSelectChange = (userId: string, value: string) => {
    console.log("Select changed for user:", userId, "new value:", value)
    setSelectedRoles((prev) => {
      const updated = { ...prev, [userId]: value }
      console.log("Updated selectedRoles state:", updated)
      return updated
    })
  }

  console.log("Current selectedRoles state:", selectedRoles)
  console.log("Users prop:", users)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Role Management</h2>
        <div className="text-sm text-muted-foreground ml-auto">Manage user roles and permissions</div>
      </div>

      <div className="grid gap-4">
        {users && users.length > 0 ? (
          users.map((user) => {
            const selectedRole = selectedRoles[user.id]
            const hasChanges = selectedRole && selectedRole !== user.role

            console.log(`User ${user.id}: current=${user.role}, selected=${selectedRole}, hasChanges=${hasChanges}`)

            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {user.firstName} {user.lastName}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Current Role:</span>
                      <Badge
                        className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || "bg-gray-100 text-gray-800"}
                      >
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {ROLE_DESCRIPTIONS[user.role as keyof typeof ROLE_DESCRIPTIONS]}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Change Role:</div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedRole || ""}
                          onValueChange={(value) => handleSelectChange(user.id, value)}
                          disabled={loading[user.id]}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select new role" />
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
                          onClick={() => selectedRole && handleRoleChange(user.id, selectedRole)}
                          disabled={loading[user.id] || !hasChanges}
                          size="sm"
                          variant={hasChanges ? "default" : "secondary"}
                        >
                          {loading[user.id] ? "Updating..." : hasChanges ? "Update Role" : "Select Role"}
                        </Button>
                      </div>
                    </div>

                    {hasChanges && (
                      <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        Role will change from <strong>{user.role}</strong> to <strong>{selectedRole}</strong>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">No users found to manage roles.</div>
        )}
      </div>
    </div>
  )
}
