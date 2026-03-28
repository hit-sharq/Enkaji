"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  Mail,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Store,
  Trash2,
  UserCog,
  Wallet,
  Clock,
  RefreshCw,
  Crown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReviewsManagement } from "@/components/admin/reviews-management"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
  isActive: boolean
  sellerProfile?: {
    businessName?: string | null
    businessType?: string | null
    isVerified: boolean
  } | null
}

interface Product {
  id: string
  name: string
  price: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  seller: {
    firstName: string
    lastName: string
    email: string
  }
  category: {
    name: string
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  buyer: {
    firstName: string
    lastName: string
    email: string
  }
  items: {
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

interface AdminDashboardProps {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    role: string
    imageUrl?: string | null
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("users")
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})
  const [roleUpdateLoading, setRoleUpdateLoading] = useState<Record<string, boolean>>({})
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  })
  const [loading, setLoading] = useState(true)

  // Payout state
  const [payouts, setPayouts] = useState<Array<{
    id: string
    sellerId: string
    amount: number
    status: string
    method: string
    createdAt: string
    processedAt: string | null
    seller?: {
      firstName: string
      lastName: string
      email: string
      sellerProfile?: {
        businessName?: string | null
      } | null
    }
  }>>([])
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [processingPayout, setProcessingPayout] = useState<string | null>(null)

  // Subscription state
  const [subscriptions, setSubscriptions] = useState<Array<{
    id: string
    sellerId: string
    plan: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    seller?: {
      firstName: string
      lastName: string
      email: string
      sellerProfile?: {
        businessName?: string | null
      } | null
    }
  }>>([])
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  // Bulk order management state
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL")
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Compute monthly revenue data for charts from orders
  const monthlyRevenueData = (() => {
    const now = new Date()
    const months: { month: string; revenue: number; orders: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: d.toLocaleString("default", { month: "short" }),
        revenue: 0,
        orders: 0,
      })
    }
    orders.forEach((order) => {
      const d = new Date(order.createdAt)
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth()
      if (diff >= 0 && diff < 6) {
        months[5 - diff].revenue += order.total || 0
        months[5 - diff].orders += 1
      }
    })
    return months
  })()

  const orderStatusData = (() => {
    const statusMap: Record<string, number> = {}
    orders.forEach((o) => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }))
  })()

  const PIE_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Fetch payouts when Payouts tab is selected
  useEffect(() => {
    if (activeTab === "payouts" && payouts.length === 0) {
      fetchPayouts()
    }
  }, [activeTab])

  // Fetch subscriptions when Subscriptions tab is selected
  useEffect(() => {
    if (activeTab === "subscriptions") {
      fetchSubscriptions()
    }
  }, [activeTab])

const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Single API call for all stats
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      setStats({
        totalUsers: data.totalUsers || 0,
        totalSellers: data.activeSellers || 0,
        totalProducts: data.totalProducts || 0,
        totalOrders: data.totalOrders || 0,
        totalRevenue: data.totalRevenue || 0,
        pendingApprovals: data.pendingApprovals || 0,
      })

      // Keep fetching other data if needed
      const usersResponse = await fetch("/api/admin/users")
      const usersData = await usersResponse.json()
      setUsers(Array.isArray(usersData.users) ? usersData.users : [])

      const productsResponse = await fetch("/api/admin/products")
      const productsData = await productsResponse.json()
      setProducts(Array.isArray(productsData.products) ? productsData.products : [])

      const ordersResponse = await fetch("/api/admin/orders")
      const ordersData = await ordersResponse.json()
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : [])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "activate" | "deactivate" | "delete") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${action}d successfully`,
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to update user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      })
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    console.log("Changing role for user:", userId, "to:", newRole)
    setRoleUpdateLoading((prev) => ({ ...prev, [userId]: true }))

    try {
      const response = await fetch(`/api/admin/users/${userId}/assign-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      const data = await response.json()
      console.log("Role change response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign role")
      }

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}`,
      })

      // Clear the selected role for this user
      setSelectedRoles((prev) => {
        const updated = { ...prev }
        delete updated[userId]
        return updated
      })

      // Refresh data to show updated roles
      fetchDashboardData()
    } catch (error) {
      console.error("Error assigning role:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user role",
        variant: "destructive",
      })
    } finally {
      setRoleUpdateLoading((prev) => ({ ...prev, [userId]: false }))
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

  const handleProductAction = async (productId: string, action: "approve" | "reject" | "feature" | "unfeature") => {
    try {
      let response

      if (action === "feature" || action === "unfeature") {
        // Use the dedicated feature endpoint
        response = await fetch(`/api/admin/products/${productId}/feature`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: action === "feature" }),
        })
      } else if (action === "approve" || action === "reject") {
        // Use the dedicated approve endpoint
        response = await fetch(`/api/admin/products/${productId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved: action === "approve" }),
        })
      } else {
        throw new Error("Invalid action")
      }

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${action}d successfully`,
        })
        fetchDashboardData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update product")
      }
    } catch (error) {
      console.error("Product action error:", error)
      toast({
        title: "Error",
        description: `Failed to ${action} product`,
        variant: "destructive",
      })
    }
  }

  const handleSellerVerification = async (userId: string, verify: boolean) => {
    try {
      const response = await fetch(`/api/admin/sellers/${userId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verified: verify,
          reason: verify ? "Seller verified by admin" : "Seller verification rejected by admin",
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Seller ${verify ? "verified" : "unverified"} successfully`,
        })
        fetchDashboardData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update seller verification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update seller verification",
        variant: "destructive",
      })
    }
  }

  const handleBulkOrderAction = async (action: string) => {
    if (selectedOrders.size === 0) return
    setBulkActionLoading(true)
    try {
      const results = await Promise.allSettled(
        Array.from(selectedOrders).map((orderId) =>
          fetch("/api/admin/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status: action }),
          })
        )
      )
      const succeeded = results.filter((r) => r.status === "fulfilled").length
      toast({ title: "Bulk Action", description: `Updated ${succeeded} of ${selectedOrders.size} orders to ${action}` })
      setSelectedOrders(new Set())
      // Refresh orders
      const ordersResponse = await fetch("/api/admin/orders")
      const ordersData = await ordersResponse.json()
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : [])
    } catch (error) {
      toast({ title: "Error", description: "Bulk action failed", variant: "destructive" })
    } finally {
      setBulkActionLoading(false)
    }
  }

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  const toggleAllOrders = (filtered: typeof orders) => {
    if (selectedOrders.size === filtered.length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(filtered.map((o) => o.id)))
    }
  }

  const fetchPayouts = async () => {
    try {
      setPayoutLoading(true)
      const response = await fetch("/api/admin/payouts")
      if (response.ok) {
        const data = await response.json()
        setPayouts(data.payouts || [])
      }
    } catch (error) {
      console.error("Error fetching payouts:", error)
      toast({
        title: "Error",
        description: "Failed to load payout data",
        variant: "destructive",
      })
    } finally {
      setPayoutLoading(false)
    }
  }

  const handlePayoutAction = async (payoutId: string, action: "approve" | "reject") => {
    try {
      setProcessingPayout(payoutId)
      const response = await fetch(`/api/admin/payouts/${payoutId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          approved: action === "approve",
          notes: action === "approve" ? "Payout approved by admin" : "Payout rejected by admin"
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Payout ${action}d successfully`,
        })
        fetchPayouts()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} payout`)
      }
    } catch (error) {
      console.error("Payout action error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${action} payout`,
        variant: "destructive",
      })
    } finally {
      setProcessingPayout(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case "PROCESSING":
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>
      case "PENDING":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case "REJECTED":
      case "FAILED":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> {status}</Badge>
      case "ACTIVE":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Active</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      case "PAST_DUE":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Past Due</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionLoading(true)
      // Fetch subscriptions from database
      const response = await fetch("/api/admin/subscriptions")
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions || [])
      } else {
        // If API doesn't exist, fetch from users with seller role
        const usersResponse = await fetch("/api/admin/users")
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          // Filter users with subscriptions - we need to check if the API returns this
          setSubscriptions([])
        }
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      })
    } finally {
      setSubscriptionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSellers}</div>
            <p className="text-xs text-muted-foreground">Registered sellers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Listed products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total platform revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all platform users, their roles, and account status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Change Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userItem) => {
                    const selectedRole = selectedRoles[userItem.id]
                    const hasRoleChange = selectedRole && selectedRole !== userItem.role

                    return (
                      <TableRow key={userItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {userItem.firstName} {userItem.lastName}
                            </div>
                            {userItem.sellerProfile && (
                              <div className="text-sm text-muted-foreground">{userItem.sellerProfile.businessName}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              userItem.role === "ADMIN"
                                ? "destructive"
                                : userItem.role === "SELLER"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {userItem.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={selectedRole || ""}
                              onValueChange={(value) => handleSelectChange(userItem.id, value)}
                              disabled={roleUpdateLoading[userItem.id]}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select role" />
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
                              onClick={() => selectedRole && handleRoleChange(userItem.id, selectedRole)}
                              disabled={roleUpdateLoading[userItem.id] || !hasRoleChange}
                              size="sm"
                              variant={hasRoleChange ? "default" : "secondary"}
                            >
                              {roleUpdateLoading[userItem.id] ? (
                                <>
                                  <UserCog className="h-3 w-3 mr-1 animate-spin" />
                                  Updating...
                                </>
                              ) : hasRoleChange ? (
                                <>
                                  <UserCog className="h-3 w-3 mr-1" />
                                  Update
                                </>
                              ) : (
                                "Select Role"
                              )}
                            </Button>
                          </div>
                          {hasRoleChange && (
                            <div className="text-xs text-blue-600 mt-1">
                              {userItem.role} → {selectedRole}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={userItem.isActive ? "default" : "destructive"}>
                            {userItem.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(userItem.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {userItem.isActive ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userItem.id, "deactivate")}
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUserAction(userItem.id, "activate")}
                              >
                                Activate
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleUserAction(userItem.id, "delete")}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product Management */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
              <CardDescription>Review, approve, and manage all product listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {product.seller.firstName} {product.seller.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{product.seller.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category.name}</TableCell>
                      <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Badge variant={product.isActive ? "default" : "destructive"}>
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleProductAction(product.id, product.isActive ? "reject" : "approve")}
                          >
                            {product.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleProductAction(product.id, product.isFeatured ? "unfeature" : "feature")
                            }
                          >
                            {product.isFeatured ? "Unfeature" : "Feature"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Order Management */}
        <TabsContent value="orders" className="space-y-4">
          {/* Filters + Bulk Actions Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Orders</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
              </SelectContent>
            </Select>
            {selectedOrders.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">{selectedOrders.size} selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkOrderAction("CONFIRMED")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkActionLoading}
                  onClick={() => handleBulkOrderAction("CANCELLED")}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={bulkActionLoading}
                  onClick={() => setSelectedOrders(new Set())}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Disputed Orders Alert */}
          {orders.filter((o) => o.status === "DISPUTED").length > 0 && (
            <Card className="border-orange-300 bg-orange-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                  <div>
                    <p className="font-medium text-orange-800">
                      {orders.filter((o) => o.status === "DISPUTED").length} Disputed Order(s) Require Attention
                    </p>
                    <p className="text-sm text-orange-600">Use the filter above to view disputed orders and take action.</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto border-orange-400 text-orange-700"
                    onClick={() => setOrderStatusFilter("DISPUTED")}
                  >
                    View Disputes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Monitor and manage all platform orders</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const filteredOrders = orderStatusFilter === "ALL"
                  ? orders
                  : orders.filter((o) => o.status === orderStatusFilter)
                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={filteredOrders.length > 0 && selectedOrders.size === filteredOrders.length}
                            onChange={() => toggleAllOrders(filteredOrders)}
                          />
                        </TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className={order.status === "DISPUTED" ? "bg-orange-50" : ""}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                className="rounded"
                                checked={selectedOrders.has(order.id)}
                                onChange={() => toggleOrderSelection(order.id)}
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {order.buyer.firstName} {order.buyer.lastName}
                                </div>
                                <div className="text-sm text-muted-foreground">{order.buyer.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {order.items.map((item, index) => (
                                  <div key={index}>
                                    {item.quantity}x {item.product.name}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>KSh {order.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  order.status === "DELIVERED"
                                    ? "default"
                                    : order.status === "CANCELLED"
                                      ? "destructive"
                                      : order.status === "DISPUTED"
                                        ? "secondary"
                                        : "secondary"
                                }
                                className={order.status === "DISPUTED" ? "bg-orange-100 text-orange-700 border-orange-300" : ""}
                              >
                                {order.status === "DISPUTED" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {order.status === "DISPUTED" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-300"
                                    onClick={() => handleBulkOrderAction("CONFIRMED")}
                                  >
                                    Resolve
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seller Verification */}
        <TabsContent value="sellers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seller Verification</CardTitle>
              <CardDescription>Review and verify seller accounts and business information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter((user) => user.role === "SELLER" && user.sellerProfile)
                    .map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {seller.firstName} {seller.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{seller.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{seller.sellerProfile?.businessName}</TableCell>
                        <TableCell>{seller.sellerProfile?.businessType}</TableCell>
                        <TableCell>
                          <Badge variant={seller.sellerProfile?.isVerified ? "default" : "destructive"}>
                            {seller.sellerProfile?.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(seller.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {seller.sellerProfile?.isVerified ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSellerVerification(seller.id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Unverify
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleSellerVerification(seller.id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout Management */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Payout Management</h2>
              <p className="text-gray-600">Manage seller payout requests and approvals</p>
            </div>
            <Button variant="outline" onClick={fetchPayouts} disabled={payoutLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${payoutLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Payout Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSh {payouts.filter(p => p.status === "PENDING").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "PENDING").length} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSh {payouts.filter(p => p.status === "PROCESSING").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "PROCESSING").length} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  KSh {payouts.filter(p => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {payouts.filter(p => p.status === "COMPLETED").length} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payout Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Payout Requests</CardTitle>
              <CardDescription>Review and process seller payout requests</CardDescription>
            </CardHeader>
            <CardContent>
              {payoutLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : payouts.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No payout requests</h3>
                  <p className="text-gray-600">Payout requests from sellers will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payout.seller?.firstName} {payout.seller?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{payout.seller?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payout.seller?.sellerProfile?.businessName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{payout.method}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">KSh {payout.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {payout.status === "PENDING" && (
                            <div className="flex space-x-2">
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handlePayoutAction(payout.id, "approve")}
                                disabled={processingPayout === payout.id}
                              >
                                {processingPayout === payout.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handlePayoutAction(payout.id, "reject")}
                                disabled={processingPayout === payout.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {payout.status === "PROCESSING" && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePayoutAction(payout.id, "approve")}
                              disabled={processingPayout === payout.id}
                            >
                              {processingPayout === payout.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </>
                              )}
                            </Button>
                          )}
                          {(payout.status === "COMPLETED" || payout.status === "REJECTED") && (
                            <span className="text-sm text-muted-foreground">
                              {payout.status === "COMPLETED" ? "Processed" : "Rejected"}
                              {payout.processedAt && ` on ${new Date(payout.processedAt).toLocaleDateString()}`}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Management */}
        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Subscription Management</h2>
              <p className="text-gray-600">Manage seller subscriptions and plans</p>
            </div>
            <Button variant="outline" onClick={fetchSubscriptions} disabled={subscriptionLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${subscriptionLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Subscription Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <Crown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
                <p className="text-xs text-muted-foreground">Active sellers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Basic Plan</CardTitle>
                <Badge variant="outline">Free</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(s => s.plan === "BASIC").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptions.filter(s => s.status === "ACTIVE" && s.plan === "BASIC").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Premium Plan</CardTitle>
                <Badge className="bg-yellow-500">KES 1,500/mo</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(s => s.plan === "PREMIUM").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptions.filter(s => s.status === "ACTIVE" && s.plan === "PREMIUM").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Enterprise Plan</CardTitle>
                <Badge className="bg-purple-500">KES 5,000/mo</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(s => s.plan === "ENTERPRISE").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscriptions.filter(s => s.status === "ACTIVE" && s.plan === "ENTERPRISE").length} active
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View and manage seller subscription plans</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No subscriptions yet</h3>
                  <p className="text-gray-600">Seller subscriptions will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Business</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period Start</TableHead>
                      <TableHead>Period End</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {subscription.seller?.firstName} {subscription.seller?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{subscription.seller?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{subscription.seller?.sellerProfile?.businessName || "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant={subscription.plan === "ENTERPRISE" ? "default" : subscription.plan === "PREMIUM" ? "secondary" : "outline"}>
                            {subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                        <TableCell>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Management */}
        <TabsContent value="reviews" className="space-y-4">
          <ReviewsManagement />
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          {/* Summary Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">KSh {stats.totalRevenue.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Active Sellers</p>
                <p className="text-2xl font-bold">{stats.totalSellers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Revenue Trend (6 months)
                </CardTitle>
                <CardDescription>Monthly revenue in KSh</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyRevenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => [`KSh ${value.toLocaleString()}`, "Revenue"]} />
                    <Area type="monotone" dataKey="revenue" stroke="#16a34a" fill="url(#revenueGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Orders per month */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Orders per Month
                </CardTitle>
                <CardDescription>Order volume over last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: number) => [value, "Orders"]} />
                    <Bar dataKey="orders" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Order Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status Breakdown</CardTitle>
              <CardDescription>Distribution of all orders by current status</CardDescription>
            </CardHeader>
            <CardContent>
              {orderStatusData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }: { name: string; percent: number }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {orderStatusData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 min-w-[180px]">
                    {orderStatusData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-sm capitalize">{item.name.toLowerCase().replace(/_/g, " ")}</span>
                        </div>
                        <Badge variant="secondary">{item.value}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No order data yet</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" defaultValue="Enkaji Trade Kenya" />
                </div>
                <div>
                  <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                  <Input id="commission-rate" type="number" defaultValue="5" />
                </div>
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Select defaultValue="off">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="on">On</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>Manage automated email templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Welcome Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Order Confirmation
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Seller Verification
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Mail className="h-4 w-4 mr-2" />
                    Newsletter Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
