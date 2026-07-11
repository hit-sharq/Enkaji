"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, User, CreditCard, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface OrderItem {
  id: string
  quantity: number
  price: number
  total: number
  product: {
    id: string
    name: string
    images: string[]
    seller: {
      firstName: string | null
      lastName: string | null
      email: string
      sellerProfile: {
        businessName: string | null
      } | null
    }
  }
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  updatedAt: string
  trackingNumber?: string | null
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  items: OrderItem[]
}

interface OrderDetailsProps {
  orderId: string
  userId: string
}

export function OrderDetails({ orderId, userId }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchOrderDetails()
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        setError("Order not found or access denied")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      setError("Failed to load order details")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-enkaji-gold text-enkaji-gold"
      case "CONFIRMED":
        return "bg-chart-4 text-chart-4"
      case "SHIPPED":
        return "bg-chart-5 text-chart-5"
      case "DELIVERED":
        return "bg-enkaji-green text-enkaji-green"
      case "CANCELLED":
        return "bg-enkaji-red text-enkaji-red"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-enkaji-ochre" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h3>
        <p className="text-muted-foreground mb-4">{error || "The order you're looking for doesn't exist."}</p>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button onClick={() => router.back()} variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id.slice(-8)}</p>
        </div>
        <Badge className={getStatusColor(order.status)} variant="secondary">
          {order.status}
        </Badge>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Order Information */}
         <div className="lg:col-span-2 space-y-6">
           {/* Cancel Order Button (for pending orders) */}
           {order.status === "PENDING" && (
             <div className="mb-6">
               <Button 
                 onClick={() => {
                   if (window.confirm('Are you sure you want to cancel this order?')) {
                     // TODO: Implement cancel order API call
                     alert('Cancel order functionality would be implemented here');
                   }
                 }}
                 variant="destructive"
                 size="sm"
               >
                 Cancel Order
               </Button>
             </div>
           )}
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {item.product.images && item.product.images.length > 0 ? (
                        <img
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Sold by:{" "}
                        {item.product.seller.sellerProfile?.businessName ||
                          `${item.product.seller.firstName} ${item.product.seller.lastName}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × KSh {item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">KSh {item.total.toLocaleString()}</p>
                      <Link href={`/products/${item.product.id}`}>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          View Product
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span>{new Date(order.updatedAt).toLocaleDateString()}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between">
                  <span>Tracking:</span>
                  <span className="font-mono text-sm">{order.trackingNumber}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>KSh {order.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {order.user.firstName} {order.user.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{order.user.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
