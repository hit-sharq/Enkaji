import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { Package, Heart, ShoppingCart, User } from "lucide-react"
import Link from "next/link"

interface BuyerDashboardProps {
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    imageUrl: string | null
  }
}

async function getBuyerStats(userId: string) {
  const [orders, favorites, cartItems] = await Promise.all([
    db.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            artisan: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      take: 4,
    }),
    db.cartItem.count({
      where: { userId },
    }),
  ])

  return { orders, favorites, cartItems }
}

export async function BuyerDashboard({ user }: BuyerDashboardProps) {
  const { orders, favorites, cartItems } = await getBuyerStats(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName || "Friend"}!
        </h1>
        <p className="text-gray-600">Manage your orders, favorites, and profile</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              </div>
              <Heart className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cart Items</p>
                <p className="text-2xl font-bold text-gray-900">{cartItems}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile</p>
                <p className="text-sm text-gray-900">Complete</p>
              </div>
              <User className="w-8 h-8 text-red-800" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {order.orderItems.length} items • ${order.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>{order.status}</Badge>
                  </div>
                ))}
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-red-800 hover:bg-red-900">Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card>
          <CardHeader>
            <CardTitle>Your Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                    <div className="flex-1">
                      <p className="font-medium">{favorite.product.name}</p>
                      <p className="text-sm text-gray-600">
                        ${favorite.product.price.toFixed(2)} • {favorite.product.category.name}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Favorites
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No favorites yet</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-red-800 hover:bg-red-900">Discover Products</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
