"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, ShoppingCart, TrendingUp, Users, Plus, Eye, Edit, Trash2, Loader2, DollarSign, Wallet, Clock, CheckCircle, XCircle, Crown, CreditCard, Calendar } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  imageUrl?: string | null
  sellerProfile?: {
    isVerified?: boolean
    businessName?: string | null
    businessType?: string | null
    description?: string | null
  } | null
}

interface SellerDashboardProps {
  user: User
}

interface DashboardData {
  totalProducts: number
  totalOrders: number
  completedOrders: number
  pendingOrders: number
  totalRevenue: number
  products: Array<{
    id: string
    name: string
    price: number
    stock: number
    status: string
    images: string[]
    category?: string
    sellerId: string
    _count: {
      orderItems: number
    }
  }>
  orders: Array<{
    id: string
    status: string
    total: number
    createdAt: string
    items: Array<{
      id: string
      quantity: number
      price: number
      total: number
      product: {
        id: string
        name: string
        sellerId: string
      }
    }>
  }>
}

export function SellerDashboard({ user }: SellerDashboardProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalProducts: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    products: [],
    orders: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  
  // Payout state
  const [payoutData, setPayoutData] = useState<{
    payouts: Array<{
      id: string
      amount: number
      status: string
      method: string
      createdAt: string
      processedAt: string | null
    }>
    payoutRequests: Array<{
      id: string
      amount: number
      status: string
      method: string
      createdAt: string
      processedAt: string | null
    }>
    stats: {
      totalEarnings: number
      pendingPayouts: number
      completedPayouts: number
    }
  }>({
    payouts: [],
    payoutRequests: [],
    stats: {
      totalEarnings: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
    },
  })
  const [isPayoutLoading, setIsPayoutLoading] = useState(false)
  const [showPayoutDialog, setShowPayoutDialog] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutMethod, setPayoutMethod] = useState("PESAPAL")
  const [payoutPhone, setPayoutPhone] = useState("")
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)

  // Subscription state
  const [subscriptionData, setSubscriptionData] = useState<{
    subscription: {
      id: string
      plan: string
      status: string
      currentPeriodStart: string
      currentPeriodEnd: string
    } | null
    plans: {
      [key: string]: {
        name: string
        price: number
        features: string[]
      }
    }
  }>({
    subscription: null,
    plans: {},
  })
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false)
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")
  const [isUpgrading, setIsUpgrading] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/seller/dashboard")
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Fetch payout data
  useEffect(() => {
    const fetchPayoutData = async () => {
      try {
        setIsPayoutLoading(true)
        const response = await fetch("/api/seller/payouts")
        if (response.ok) {
          const data = await response.json()
          setPayoutData({
            payouts: data.payouts || [],
            payoutRequests: data.payoutRequests || [],
            stats: data.stats || {
              totalEarnings: 0,
              pendingPayouts: 0,
              completedPayouts: 0,
            },
          })
        }
      } catch (error) {
        console.error("Error fetching payout data:", error)
      } finally {
        setIsPayoutLoading(false)
      }
    }

    if (activeTab === "payouts") {
      fetchPayoutData()
    }
  }, [activeTab])

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setIsSubscriptionLoading(true)
        const response = await fetch("/api/subscriptions")
        if (response.ok) {
          const data = await response.json()
          setSubscriptionData({
            subscription: data.subscription,
            plans: data.plans,
          })
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error)
      } finally {
        setIsSubscriptionLoading(false)
      }
    }

    if (activeTab === "subscriptions") {
      fetchSubscriptionData()
    }
  }, [activeTab])

  const handleRequestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to withdraw",
        variant: "destructive",
      })
      return
    }

    const amount = parseFloat(payoutAmount)
    const availableBalance = payoutData.stats.totalEarnings - payoutData.stats.pendingPayouts

    if (amount > availableBalance) {
      toast({
        title: "Insufficient Balance",
        description: `You can only withdraw up to KES ${availableBalance.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    setIsRequestingPayout(true)
    try {
      const response = await fetch("/api/seller/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          method: payoutMethod,
          recipientDetails: {
            phone: payoutPhone,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Payout Requested",
          description: `Your payout request of KES ${amount.toLocaleString()} has been submitted`,
        })
        setShowPayoutDialog(false)
        setPayoutAmount("")
        setPayoutPhone("")
        
        // Refresh payout data
        const refreshResponse = await fetch("/api/seller/payouts")
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setPayoutData({
            payouts: data.payouts || [],
            payoutRequests: data.payoutRequests || [],
            stats: data.stats || {
              totalEarnings: 0,
              pendingPayouts: 0,
              completedPayouts: 0,
            },
          })
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to request payout")
      }
    } catch (error) {
      console.error("Error requesting payout:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request payout",
        variant: "destructive",
      })
    } finally {
      setIsRequestingPayout(false)
    }
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast({
        title: "Select a Plan",
        description: "Please select a subscription plan",
        variant: "destructive",
      })
      return
    }

    setIsUpgrading(true)
    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          paymentMethod: "card",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // If there's a client secret, it means payment is required
        if (data.clientSecret) {
          toast({
            title: "Payment Required",
            description: "Please complete your payment to activate the subscription",
          })
          // In a full implementation, you would integrate with Stripe here
          // For now, we'll just refresh the data
        } else {
          toast({
            title: "Subscription Activated",
            description: `You've successfully subscribed to the ${selectedPlan} plan`,
          })
        }
        
        setShowSubscriptionDialog(false)
        setSelectedPlan("")
        
        // Refresh subscription data
        const refreshResponse = await fetch("/api/subscriptions")
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          setSubscriptionData({
            subscription: data.subscription,
            plans: data.plans,
          })
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to subscribe")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe to plan",
        variant: "destructive",
      })
    } finally {
      setIsUpgrading(false)
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
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Seller Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user.firstName}!{user.sellerProfile?.businessName && ` - ${user.sellerProfile.businessName}`}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="payouts">Earnings</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.products.filter((p) => p.status === "APPROVED").length} active listings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.totalOrders > 0 ? "Orders received" : "No orders yet"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KES {dashboardData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From completed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardData.products.filter((p) => p.status === "APPROVED").length}
                </div>
                <p className="text-xs text-muted-foreground">Out of {dashboardData.totalProducts} total</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No orders yet. Start by adding products to your store!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES {Number(order.total).toLocaleString()}</p>
                        <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                          {order.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Products</h2>
            <Link href="/dashboard/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>

          <Card>
            <CardContent className="p-0">
              {dashboardData.products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600 mb-4">Start selling by adding your first product</p>
                  <Link href="/dashboard/products/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 p-6">
                  {dashboardData.products.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">
                          Stock: {product.stock} units • {product.category || "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/products/${product.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <h2 className="text-2xl font-bold">Order Management</h2>

          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Manage your customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData.orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders will appear here when customers purchase your products</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-8)}</p>
                        <p className="text-sm text-gray-600">
                          {order.items.map((item) => item.product.name).join(", ")} •{" "}
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">KES {Number(order.total).toLocaleString()}</p>
                          <Badge variant={order.status === "DELIVERED" ? "default" : "secondary"}>
                            {order.status.toLowerCase()}
                          </Badge>
                        </div>
                        <Link href={`/orders/${order.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Subscription</h2>
              <p className="text-gray-600">Manage your seller subscription plan</p>
            </div>
            <Button onClick={() => setShowSubscriptionDialog(true)}>
              <Crown className="h-4 w-4 mr-2" />
              {subscriptionData.subscription ? "Change Plan" : "Subscribe"}
            </Button>
          </div>

          {/* Current Subscription */}
          {isSubscriptionLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : subscriptionData.subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{subscriptionData.subscription.plan}</p>
                      <p className="text-gray-600">
                        {subscriptionData.plans[subscriptionData.subscription.plan]?.name || subscriptionData.subscription.plan}
                      </p>
                    </div>
                    <Badge 
                      variant={subscriptionData.subscription.status === "ACTIVE" ? "default" : "destructive"}
                      className={subscriptionData.subscription.status === "ACTIVE" ? "bg-green-500" : ""}
                    >
                      {subscriptionData.subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Billing Period</span>
                    </div>
                    <p className="text-sm">
                      {new Date(subscriptionData.subscription.currentPeriodStart).toLocaleDateString()} - {" "}
                      {new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>

                  {subscriptionData.plans[subscriptionData.subscription.plan] && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-2">Plan Features:</p>
                      <ul className="space-y-1">
                        {subscriptionData.plans[subscriptionData.subscription.plan].features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plan Comparison</CardTitle>
                  <CardDescription>Compare available plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(subscriptionData.plans).map(([planKey, plan]) => (
                      <div key={planKey} className={`p-4 border rounded-lg ${subscriptionData.subscription?.plan === planKey ? "bg-blue-50 border-blue-200" : ""}`}>
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-sm text-gray-600">
                              {plan.price === 0 ? "Free" : `KES ${plan.price.toLocaleString()}/month`}
                            </p>
                          </div>
                          {subscriptionData.subscription?.plan === planKey && (
                            <Badge className="bg-blue-500">Current</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>Subscribe to a plan to unlock more features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(subscriptionData.plans).map(([planKey, plan]) => (
                    <div key={planKey} className="p-4 border rounded-lg text-center">
                      <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-2xl font-bold my-2">
                        {plan.price === 0 ? "Free" : `KES ${plan.price.toLocaleString()}`}
                        {plan.price > 0 && <span className="text-sm font-normal">/mo</span>}
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        {plan.features.slice(0, 3).map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                      <Button 
                        variant={planKey === "BASIC" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(planKey)
                          setShowSubscriptionDialog(true)
                        }}
                      >
                        {planKey === "BASIC" ? "Get Started" : "Upgrade"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Dialog */}
          <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Subscription Plan</DialogTitle>
                <DialogDescription>
                  Choose a plan that best fits your business needs
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(subscriptionData.plans).map(([planKey, plan]) => (
                  <div 
                    key={planKey}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPlan === planKey ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPlan(planKey)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-gray-600">
                          {plan.price === 0 ? "Free forever" : `KES ${plan.price.toLocaleString()}/month`}
                        </p>
                      </div>
                      {selectedPlan === planKey && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <ul className="mt-2 space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                
                <Button 
                  className="w-full" 
                  onClick={handleSubscribe}
                  disabled={!selectedPlan || isUpgrading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {selectedPlan && subscriptionData.plans[selectedPlan]?.price === 0 
                        ? "Activate Free Plan" 
                        : "Subscribe Now"}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <h2 className="text-2xl font-bold">Seller Profile</h2>

          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Manage your seller profile and business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Business Name</label>
                  <p className="text-gray-600">{user.sellerProfile?.businessName || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Business Type</label>
                  <p className="text-gray-600">{user.sellerProfile?.businessType || "Not set"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-gray-600">{user.sellerProfile?.description || "No description provided"}</p>
                </div>
              </div>
              <Button>Edit Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
