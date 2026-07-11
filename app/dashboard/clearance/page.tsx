import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, Sparkles, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function SellerClearancePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const business = await db.clearanceBusiness.findUnique({
    where: { userId: user.id },
  })

  if (!business || !business.isApproved) {
    return (
      <div className="min-h-screen bg-muted py-10">
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="rounded-2xl border-0 bg-card/80 backdrop-blur-sm shadow-sm">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-enkaji-gold/10 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-enkaji-ochre" />
                </div>
                <CardTitle className="text-xl">Approval Required</CardTitle>
                <CardDescription>
                  You need an approved clearance business account to view and manage clearance deals.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Submit your business details for review. Once approved, you'll be able to create and manage clearance listings.
                </p>
                <Link href="/dashboard/clearance/apply">
                  <Button className="bg-enkaji-ink text-white rounded-xl">
                    Apply for Clearance Access
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const clearanceProducts = await db.product.findMany({
    where: {
      sellerId: user.id,
      isClearance: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const pendingCount = clearanceProducts.filter(p => !p.isShopApproved).length
  const approvedCount = clearanceProducts.filter(p => p.isShopApproved).length

  return (
    <div className="min-h-screen bg-muted py-10">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-enkaji-ink">Clearance Listings</h1>
            <p className="mt-2 text-muted-foreground">Manage your discount stock. All deals require admin approval before going live.</p>
          </div>
          <Link href="/dashboard/clearance/new">
            <Button className="bg-enkaji-ink text-white">Add Clearance Deal</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-enkaji-ink">{clearanceProducts.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Live Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-enkaji-green">{approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-enkaji-ochre">{pendingCount}</div>
              {pendingCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">Awaiting admin review</p>
              )}
            </CardContent>
          </Card>
        </div>

        {clearanceProducts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold text-enkaji-ink">No clearance listings yet</h2>
              <p className="mt-2 text-muted-foreground">Create a clearance deal to convert excess inventory into cash quickly.</p>
              <Link href="/dashboard/clearance/new">
                <Button className="mt-6 bg-enkaji-ink text-white">Create First Clearance Deal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {clearanceProducts.map((product) => {
              const discount = product.comparePrice && Number(product.comparePrice) > Number(product.price)
                ? Math.round(((Number(product.comparePrice) - Number(product.price)) / Number(product.comparePrice)) * 100)
                : 0

              const statusBadge = !product.isShopApproved ? (
                <Badge variant="outline" className="bg-enkaji-gold/10 text-enkaji-ochre border-enkaji-gold/30">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Approval
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-enkaji-green text-enkaji-green border-enkaji-green">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )

              return (
                <Card key={product.id} className="overflow-hidden">
                  <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-lg font-semibold text-enkaji-ink">{product.name}</p>
                        {statusBadge}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.category?.name || "Uncategorized"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{product.clearanceReason || "Clearance deal"} • Ends {product.clearanceEndDate ? new Date(product.clearanceEndDate).toLocaleDateString() : "—"}</p>
                      {!product.isShopApproved && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-enkaji-ochre">
                          <AlertTriangle className="h-3 w-3" />
                          This deal is awaiting admin approval and is not yet visible to buyers.
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-start sm:items-end">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-enkaji-ink">KES {Number(product.price).toLocaleString()}</p>
                        {product.comparePrice && (
                          <p className="text-sm text-muted-foreground line-through">KES {Number(product.comparePrice).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-enkaji-gold/10 px-3 py-1 text-xs font-semibold text-enkaji-ochre">{discount}% OFF</span>
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-enkaji-ink">{product.inventory} left</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
