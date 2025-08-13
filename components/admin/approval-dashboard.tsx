"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Package, User, Store, DollarSign, AlertTriangle, CheckCircle, XCircle, Clock, Eye } from "lucide-react"

interface PendingApprovals {
  pendingProducts: any[]
  pendingArtisans: any[]
  unverifiedSellers: any[]
  pendingPayouts: any[]
  openDisputes: any[]
  summary: {
    totalPendingProducts: number
    totalPendingArtisans: number
    totalUnverifiedSellers: number
    totalPendingPayouts: number
    totalOpenDisputes: number
  }
}

export function ApprovalDashboard() {
  const [approvals, setApprovals] = useState<PendingApprovals | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchPendingApprovals()
  }, [])

  const fetchPendingApprovals = async () => {
    try {
      const response = await fetch("/api/admin/pending-approvals")
      if (response.ok) {
        const data = await response.json()
        setApprovals(data)
      }
    } catch (error) {
      console.error("Error fetching pending approvals:", error)
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProductApproval = async (productId: string, approved: boolean, reason?: string) => {
    setActionLoading(productId)
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, reason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${approved ? "approved" : "rejected"} successfully`,
        })
        fetchPendingApprovals()
      } else {
        throw new Error("Failed to process approval")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process product approval",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleArtisanApproval = async (artisanId: string, approved: boolean, reason?: string) => {
    setActionLoading(artisanId)
    try {
      const response = await fetch(`/api/admin/artisans/${artisanId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, reason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Artisan ${approved ? "approved" : "rejected"} successfully`,
        })
        fetchPendingApprovals()
      } else {
        throw new Error("Failed to process approval")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process artisan approval",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSellerVerification = async (sellerId: string, verified: boolean, reason?: string) => {
    setActionLoading(sellerId)
    try {
      const response = await fetch(`/api/admin/sellers/${sellerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified, reason }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Seller ${verified ? "verified" : "rejected"} successfully`,
        })
        fetchPendingApprovals()
      } else {
        throw new Error("Failed to process verification")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process seller verification",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePayoutApproval = async (payoutId: string, approved: boolean, notes?: string) => {
    setActionLoading(payoutId)
    try {
      const response = await fetch(`/api/admin/payouts/${payoutId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, notes }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Payout ${approved ? "approved" : "rejected"} successfully`,
        })
        fetchPendingApprovals()
      } else {
        throw new Error("Failed to process payout")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payout approval",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!approvals) {
    return <div>Failed to load approvals</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.summary.totalPendingProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Artisans</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.summary.totalPendingArtisans}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unverified Sellers</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.summary.totalUnverifiedSellers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.summary.totalPendingPayouts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvals.summary.totalOpenDisputes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products ({approvals.summary.totalPendingProducts})</TabsTrigger>
          <TabsTrigger value="artisans">Artisans ({approvals.summary.totalPendingArtisans})</TabsTrigger>
          <TabsTrigger value="sellers">Sellers ({approvals.summary.totalUnverifiedSellers})</TabsTrigger>
          <TabsTrigger value="payouts">Payouts ({approvals.summary.totalPendingPayouts})</TabsTrigger>
          <TabsTrigger value="disputes">Disputes ({approvals.summary.totalOpenDisputes})</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {approvals.pendingProducts.map((product) => (
            <Card key={product.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>
                      by {product.seller.firstName} {product.seller.lastName} • {product.category.name}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                    <p className="font-semibold">KES {product.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={actionLoading === product.id}>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reject Product</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reject this product? Please provide a reason.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea placeholder="Reason for rejection..." />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleProductApproval(product.id, false, "Rejected by moderator")}
                          >
                            Reject
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      onClick={() => handleProductApproval(product.id, true)}
                      size="sm"
                      disabled={actionLoading === product.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {actionLoading === product.id ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {approvals.pendingProducts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending products to review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Artisans Tab */}
        <TabsContent value="artisans" className="space-y-4">
          {approvals.pendingArtisans.map((artisan) => (
            <Card key={artisan.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {artisan.user.firstName} {artisan.user.lastName}
                    </CardTitle>
                    <CardDescription>{artisan.user.email}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{artisan.bio}</p>
                    <p className="text-sm">
                      <strong>Skills:</strong> {artisan.skills.join(", ")}
                    </p>
                    <p className="text-sm">
                      <strong>Experience:</strong> {artisan.experience} years
                    </p>
                    <p className="text-sm">
                      <strong>Location:</strong> {artisan.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleArtisanApproval(artisan.userId, false)}
                      disabled={actionLoading === artisan.userId}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleArtisanApproval(artisan.userId, true)}
                      size="sm"
                      disabled={actionLoading === artisan.userId}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {actionLoading === artisan.userId ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {approvals.pendingArtisans.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending artisan applications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Sellers Tab */}
        <TabsContent value="sellers" className="space-y-4">
          {approvals.unverifiedSellers.map((seller) => (
            <Card key={seller.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{seller.businessName}</CardTitle>
                    <CardDescription>
                      {seller.user.firstName} {seller.user.lastName} • {seller.user.email}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">{seller.description}</p>
                    <p className="text-sm">
                      <strong>Business Type:</strong> {seller.businessType}
                    </p>
                    <p className="text-sm">
                      <strong>Location:</strong> {seller.location}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> {seller.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleSellerVerification(seller.userId, false)}
                      disabled={actionLoading === seller.userId}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleSellerVerification(seller.userId, true)}
                      size="sm"
                      disabled={actionLoading === seller.userId}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {actionLoading === seller.userId ? "Processing..." : "Verify"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {approvals.unverifiedSellers.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No unverified sellers</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-4">
          {approvals.pendingPayouts.map((payout) => (
            <Card key={payout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {payout.seller.firstName} {payout.seller.lastName}
                    </CardTitle>
                    <CardDescription>{payout.seller.email}</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">KES {payout.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Method: {payout.method}</p>
                    <p className="text-sm text-muted-foreground">
                      Requested: {new Date(payout.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePayoutApproval(payout.id, false, "Rejected by admin")}
                      disabled={actionLoading === payout.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handlePayoutApproval(payout.id, true)}
                      size="sm"
                      disabled={actionLoading === payout.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {actionLoading === payout.id ? "Processing..." : "Approve"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {approvals.pendingPayouts.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending payout requests</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-4">
          {approvals.openDisputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Payment Dispute</CardTitle>
                    <CardDescription>
                      Raised by {dispute.user.firstName} {dispute.user.lastName}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Open
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Reason:</strong> {dispute.reason}
                  </p>
                  <p className="text-sm text-muted-foreground">{dispute.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Order
                    </Button>
                    <Button size="sm">Resolve Dispute</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {approvals.openDisputes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No open disputes</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
