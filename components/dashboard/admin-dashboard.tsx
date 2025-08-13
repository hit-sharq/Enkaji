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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  const [users, setUsers] = useState<User[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingApprovals: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch users
      const usersResponse = await fetch("/api/admin/users")
      const usersData = await usersResponse.json()
      setUsers(Array.isArray(usersData.users) ? usersData.users : [])

      // Fetch products
      const productsResponse = await fetch("/api/admin/products")
      const productsData = await productsResponse.json()
      setProducts(Array.isArray(productsData.products) ? productsData.products : [])

      // Fetch orders
      const ordersResponse = await fetch("/api/admin/orders")
      const ordersData = await ordersResponse.json()
      setOrders(Array.isArray(ordersData.orders) ? ordersData.orders : [])

      // Calculate stats
      const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + order.total, 0)
      const pendingApprovals = usersData.filter(
        (u: User) => u.role === "SELLER" && u.sellerProfile && !u.sellerProfile.isVerified,
      ).length

      setStats({
        totalUsers: usersData.length,
        totalSellers: usersData.filter((u: User) => u.role === "SELLER").length,
        totalProducts: productsData.length,
        totalOrders: ordersData.length,
        totalRevenue,
        pendingApprovals,
      })
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

  const handleProductAction = async (productId: string, action: "approve" | "reject" | "feature" | "unfeature") => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${action}d successfully`,
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verify }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Seller ${verify ? "verified" : "unverified"} successfully`,
        })
        fetchDashboardData()
      } else {
        throw new Error("Failed to update seller verification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update seller verification",
        variant: "destructive",
      })
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
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
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
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          {user.sellerProfile && (
                            <div className="text-sm text-muted-foreground">{user.sellerProfile.businessName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "ADMIN" ? "destructive" : user.role === "SELLER" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {user.isActive ? (
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "deactivate")}>
                              Deactivate
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleUserAction(user.id, "activate")}>
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
                                <AlertDialogAction onClick={() => handleUserAction(user.id, "delete")}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Monitor and manage all platform orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {orders.map((order) => (
                    <TableRow key={order.id}>
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
                                : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Growth</CardTitle>
                <CardDescription>User registration and activity trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analytics</CardTitle>
                <CardDescription>Sales performance and revenue trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Revenue charts coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
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
