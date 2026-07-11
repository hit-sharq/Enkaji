"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Loader2, Eye } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  orderItems: OrderItem[]
}

interface OrdersListProps {
  userId: string
}

export function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [userId])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-enkaji-gold/20 text-enkaji-brown"
      case "CONFIRMED":
        return "bg-chart-4 text-chart-4"
      case "SHIPPED":
        return "bg-chart-5 text-chart-5"
      case "DELIVERED":
        return "bg-enkaji-green/20 text-enkaji-green"
      case "CANCELLED":
        return "bg-enkaji-red/15 text-enkaji-red"
      default:
        return "bg-muted text-enkaji-forest"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-enkaji-red" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-enkaji-ink mb-2">No orders yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link href="/shop">
            <Button className="bg-enkaji-red text-white">Start Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Order #{order.id.slice(-8)}</CardTitle>
              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
              <span className="font-semibold">Total: KSh {order.total.toLocaleString()}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.product.images[0] || "/placeholder.jpg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × KSh {item.price.toLocaleString()}
                      </p>
                    </div>
                    <Link href={`/products/${item.product.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No items found for this order</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View Order Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
