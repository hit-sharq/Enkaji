"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, TrendingUp, CreditCard, Smartphone, Building, CheckCircle, Clock, XCircle } from "lucide-react"

interface PaymentAnalytics {
  totalRevenue: number
  platformCommissions: number
  processingFees: number
  pendingPayouts: number
  completedPayouts: number
  paymentMethodBreakdown: {
    STRIPE: number
    MPESA: number
    BANK_TRANSFER: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    commissions: number
  }>
}

interface PayoutRequest {
  id: string
  amount: number
  payoutMethod: string
  status: string
  createdAt: string
  seller: {
    firstName: string
    lastName: string
    email: string
    sellerProfile?: {
      businessName?: string
    }
  }
}

export function PaymentAnalytics() {
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null)
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
    fetchPayoutRequests()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/payments")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching payment analytics:", error)
    }
  }

  const fetchPayoutRequests = async () => {
    try {
      const response = await fetch("/api/admin/payouts")
      if (response.ok) {
        const data = await response.json()
        setPayoutRequests(data.payoutRequests)
      }
    } catch (error) {
      console.error("Error fetching payout requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayoutAction = async (payoutRequestId: string, status: string, notes?: string) => {
    try {
      const response = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutRequestId,
          status,
          notes,
        }),
      })

      if (response.ok) {
        fetchPayoutRequests()
      }
    } catch (error) {
      console.error("Error updating payout:", error)
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "STRIPE":
        return <CreditCard className="h-4 w-4" />
      case "MPESA":
        return <Smartphone className="h-4 w-4" />
      case "BANK_TRANSFER":
        return <Building className="h-4 w-4" />
      default:
        return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {analytics?.totalRevenue.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Platform gross revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {analytics?.platformCommissions.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Commission earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {analytics?.pendingPayouts.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payouts</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {analytics?.completedPayouts.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully paid</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="trends">Revenue Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seller Payout Requests</CardTitle>
              <CardDescription>Manage seller payout requests and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {request.seller.firstName} {request.seller.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {request.seller.sellerProfile?.businessName || request.seller.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">KES {request.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(request.payoutMethod)}
                          <span>{request.payoutMethod.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.status === "COMPLETED" ? "default" : "secondary"}>
                          {getStatusIcon(request.status)}
                          <span className="ml-2">{request.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === "REQUESTED" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handlePayoutAction(request.id, "COMPLETED")}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayoutAction(request.id, "REJECTED", "Rejected by admin")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {payoutRequests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No payout requests at the moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Analytics</CardTitle>
              <CardDescription>Breakdown of payment methods used by customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.paymentMethodBreakdown &&
                  Object.entries(analytics.paymentMethodBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getPaymentMethodIcon(method)}
                        <div>
                          <p className="font-medium">{method.replace("_", " ")}</p>
                          <p className="text-sm text-gray-600">Payment method</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">KES {amount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">
                          {analytics.totalRevenue > 0 ? Math.round((amount / analytics.totalRevenue) * 100) : 0}% of
                          total
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue and commission trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.monthlyRevenue?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-600">Monthly performance</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">KES {month.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Commission: KES {month.commissions.toLocaleString()}</p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Revenue trend data will appear here as transactions are processed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
