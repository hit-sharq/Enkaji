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
        items: {
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
            seller: {
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
        <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
          Welcome back, {user.firstName || "Friend"}!
        </h1>
        <p className="text-muted-foreground">Manage your orders, favorites, and profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground">{orders.length}</p>
              </div>
              <Package className="w-8 h-8 text-enkaji-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold text-foreground">{favorites.length}</p>
              </div>
              <Heart className="w-8 h-8 text-enkaji-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cart Items</p>
                <p className="text-2xl font-bold text-foreground">{cartItems}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-enkaji-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Profile</p>
                <p className="text-sm text-foreground">Complete</p>
              </div>
              <User className="w-8 h-8 text-enkaji-gold" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-display font-semibold">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card">
                    <div>
                      <p className="font-medium">Order #{order.orderNumber || order.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • KES {order.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>{order.status}</Badge>
                  </div>
                ))}
                <Link href="/orders">
                  <Button variant="outline" className="w-full border border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
                    View All Orders
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No orders yet</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Start Shopping</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="font-display font-semibold">Your Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-card">
                    <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                      {favorite.product.images && favorite.product.images.length > 0 ? (
                        <img
                          src={favorite.product.images[0] || "/placeholder.svg"}
                          alt={favorite.product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{favorite.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        KES {favorite.product.price.toLocaleString()} • {favorite.product.category.name}
                      </p>
                    </div>
                  </div>
                ))}
                <Link href="/favorites">
                  <Button variant="outline" className="w-full border border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
                    View All Favorites
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No favorites yet</p>
                <Link href="/shop">
                  <Button className="mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Discover Products</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
