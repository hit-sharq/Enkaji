import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { Users, Package, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

interface AdminDashboardProps {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
}

async function getAdminStats() {
  const [totalUsers, totalProducts, totalOrders, pendingArtisans, totalRevenue, recentUsers, recentOrders] =
    await Promise.all([
      db.user.count(),
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.user.count({
        where: {
          role: "BUYER",
          artisanProfile: {
            isApproved: false,
          },
        },
      }),
      db.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      db.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          artisanProfile: true,
        },
      }),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      }),
    ])

  return {
    totalUsers,
    totalProducts,
    totalOrders,
    pendingArtisans,
    totalRevenue: totalRevenue._sum.total || 0,
    recentUsers,
    recentOrders,
  }
}

export async function AdminDashboard({ user }: AdminDashboardProps) {
  const stats = await getAdminStats()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, products, and monitor platform performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <Package className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals Alert */}
      {stats.pendingArtisans > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-orange-800">Pending Artisan Approvals</h3>
                <p className="text-orange-700">{stats.pendingArtisans} artisan applications waiting for approval</p>
              </div>
              <Link href="/admin/artisans">
                <Button className="bg-orange-600 hover:bg-orange-700">Review Applications</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user.role === "ADMIN" ? "destructive" : "default"}>{user.role}</Badge>
                    {user.artisanProfile && !user.artisanProfile.isApproved && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Link href="/admin/users">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage All Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.orderItems.length} items • ${order.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>{order.status}</Badge>
                </div>
              ))}
              <Link href="/admin/orders">
                <Button variant="outline" className="w-full bg-transparent">
                  Manage All Orders
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
