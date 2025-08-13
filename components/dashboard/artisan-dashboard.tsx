import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { Package, DollarSign, Eye, Plus } from "lucide-react"
import Link from "next/link"

interface ArtisanDashboardProps {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
    sellerProfile: {
      isVerified: boolean
    } | null
  }
}

async function getSellerStats(userId: string) {
  const [products, orders, totalRevenue] = await Promise.all([
    db.product.findMany({
      where: { sellerId: userId },
      include: {
        category: true,
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId: userId,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: userId,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.orderItem.aggregate({
      where: {
        product: {
          sellerId: userId,
        },
      },
      _sum: {
        price: true,
      },
    }),
  ])

  return {
    products,
    orders,
    totalRevenue: (totalRevenue._sum?.price as number | null) ?? 0,
  }
}

export async function ArtisanDashboard({ user }: ArtisanDashboardProps) {
  const { products, orders, totalRevenue } = await getSellerStats(user.id)

  if (!user.sellerProfile?.isVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="font-playfair text-2xl font-bold mb-4">Seller Verification Pending</h2>
            <p className="text-gray-600 mb-6">
              Your seller profile is currently under review. You'll be notified once it's approved and you can start
              listing your products.
            </p>
            <Badge variant="secondary" className="mb-4">
              Pending Approval
            </Badge>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Artisan Dashboard</h1>
          <p className="text-gray-600">Manage your products and track your sales</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button className="bg-red-800 hover:bg-red-900">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Eye className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">KES {totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.filter((p) => p.isActive).length}</p>
              </div>
              <Package className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        KES {product.price.toLocaleString()} • {product.category.name}
                      </p>
                      <p className="text-xs text-gray-500">{product._count.items} sales</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/products">
                  <Button variant="outline" className="w-full bg-transparent">
                    Manage All Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products yet</p>
                <Link href="/dashboard/products/new">
                  <Button className="mt-4 bg-red-800 hover:bg-red-900">Add Your First Product</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber || order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.items.length} items • KES {order.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>{order.status}</Badge>
                  </div>
                ))}
                <Link href="/orders">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
