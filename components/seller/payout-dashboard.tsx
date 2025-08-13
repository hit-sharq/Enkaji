"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, Clock, CheckCircle, Smartphone, Building } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PayoutStats {
  totalEarnings: number
  totalCommissions: number
  totalFees: number
  totalNet: number
  totalPayouts: number
  pendingAmount: number
}

interface Payout {
  id: string
  grossAmount: number
  platformCommission: number
  paymentProcessingFee: number
  netAmount: number
  status: string
  createdAt: string
  order: {
    id: string
    createdAt: string
    status: string
  }
}

export function PayoutDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<PayoutStats | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState("")
  const [accountDetails, setAccountDetails] = useState({
    phoneNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    swiftCode: "",
  })

  useEffect(() => {
    fetchPayoutData()
  }, [])

  const fetchPayoutData = async () => {
    try {
      const response = await fetch("/api/seller/payouts")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setPayouts(data.payouts)
      }
    } catch (error) {
      console.error("Error fetching payout data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayoutRequest = async () => {
    if (!payoutMethod) {
      toast({
        title: "Error",
        description: "Please select a payout method",
        variant: "destructive",
      })
      return
    }

    setRequestingPayout(true)

    try {
      const response = await fetch("/api/seller/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutMethod,
          accountDetails,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payout request submitted successfully",
        })
        fetchPayoutData()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request payout",
        variant: "destructive",
      })
    } finally {
      setRequestingPayout(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REQUESTED":
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "default"
      case "REQUESTED":
        return "secondary"
      default:
        return "secondary"
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats?.totalEarnings.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Gross sales amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              KES {((stats?.totalCommissions || 0) + (stats?.totalFees || 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Commission + processing fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats?.totalNet.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">After all deductions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {stats?.pendingAmount.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Minimum payout amount is KES 1,000. Payouts are processed within 3-5 business days.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">Available: KES {stats?.pendingAmount.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">Ready for withdrawal</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button disabled={(stats?.pendingAmount || 0) < 1000} className="bg-green-600 hover:bg-green-700">
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payout-method">Payout Method</Label>
                    <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MPESA">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            M-Pesa
                          </div>
                        </SelectItem>
                        <SelectItem value="BANK_TRANSFER">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Bank Transfer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {payoutMethod === "MPESA" && (
                    <div>
                      <Label htmlFor="phone">M-Pesa Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="0712345678"
                        value={accountDetails.phoneNumber}
                        onChange={(e) => setAccountDetails((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                  )}

                  {payoutMethod === "BANK_TRANSFER" && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          placeholder="e.g., KCB Bank"
                          value={accountDetails.bankName}
                          onChange={(e) => setAccountDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input
                          id="account-number"
                          placeholder="Account number"
                          value={accountDetails.accountNumber}
                          onChange={(e) => setAccountDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-name">Account Name</Label>
                        <Input
                          id="account-name"
                          placeholder="Account holder name"
                          value={accountDetails.accountName}
                          onChange={(e) => setAccountDetails((prev) => ({ ...prev, accountName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="swift-code">SWIFT Code (Optional)</Label>
                        <Input
                          id="swift-code"
                          placeholder="SWIFT/BIC code"
                          value={accountDetails.swiftCode}
                          onChange={(e) => setAccountDetails((prev) => ({ ...prev, swiftCode: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Amount to be paid:</strong> KES {stats?.pendingAmount.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Processing time: 3-5 business days</p>
                  </div>

                  <Button onClick={handlePayoutRequest} disabled={requestingPayout} className="w-full">
                    {requestingPayout ? "Processing..." : "Submit Payout Request"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your earnings and payout records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-mono text-sm">{payout.order.id.slice(0, 8)}...</TableCell>
                  <TableCell>KES {payout.grossAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    KES {(payout.platformCommission + payout.paymentProcessingFee).toLocaleString()}
                  </TableCell>
                  <TableCell className="font-semibold">KES {payout.netAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(payout.status) as any}>
                      {getStatusIcon(payout.status)}
                      <span className="ml-2">{payout.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payouts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">No payouts yet. Complete some orders to start earning!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
