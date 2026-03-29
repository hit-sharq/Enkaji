"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Wallet, Users, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface DriverSummary { status: string; pendingAmount: number; paidAmount: number; count: number }

export default function PayoutsAdminPage() {
  const [driverSummary, setDriverSummary] = useState<DriverSummary | null>(null)
  const [sellerSummary, setSellerSummary] = useState<DriverSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    setLoading(true)
    // Driver summary from Lumyn API
    const driverRes = await fetch('/api/lumyn/admin/payouts')
    const driverData = await driverRes.json()
    setDriverSummary({
      status: 'summary',
      pendingAmount: driverData.summary?.find((s: any) => s.status === 'pending')?._sum?.netAmount || 0,
      paidAmount: driverData.summary?.find((s: any) => s.status === 'paid')?._sum?.netAmount || 0,
      count: driverData.summary?.reduce((sum: number, s: any) => sum + s._count, 0) || 0
    })

    // Seller summary from payout requests
    const sellerRes = await fetch('/api/admin/payouts/stats')
    const sellerData = await sellerRes.json()
    setSellerSummary({
      status: 'summary',
      pendingAmount: sellerData.pendingTotal || 0,
      paidAmount: sellerData.approvedTotal || 0,
      count: sellerData.total || 0
    })

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <h1 className="text-2xl font-bold">Loading Payouts...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Payout Management
          </h1>
          <p className="text-muted-foreground">Driver earnings & seller payouts</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-600 mb-1">
              KES {driverSummary?.pendingAmount?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-muted-foreground">Driver Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              KES {sellerSummary?.pendingAmount?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-muted-foreground">Seller Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{driverSummary?.count || 0}</div>
            <p className="text-sm text-muted-foreground">Driver Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold mb-1">{sellerSummary?.count || 0}</div>
            <p className="text-sm text-muted-foreground">Seller Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="drivers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers">
            Driver Earnings ({driverSummary?.count || 0})
          </TabsTrigger>
          <TabsTrigger value="sellers">
            Seller Payouts ({sellerSummary?.count || 0})
            <Badge className="ml-2" variant="secondary">
              {Math.round((sellerSummary?.pendingAmount || 0) / 1000)}K pending
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Link href="/admin/payouts" className="block p-4 border-b hover:bg-accent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Lumyn Driver Earnings</h3>
                    <p className="text-sm text-muted-foreground">Pending, paid, bulk actions</p>
                  </div>
                  <Users className="h-5 w-5" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sellers" className="mt-6">
          <Link href="/admin/payouts/sellers">
            <Button size="lg" className="w-full">
              Manage Seller Payout Requests
            </Button>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  )
}

