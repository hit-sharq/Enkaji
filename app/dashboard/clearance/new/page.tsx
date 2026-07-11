import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ClearanceListingForm } from "@/components/dashboard/clearance-form"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Clock } from "lucide-react"

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function NewClearancePage() {
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
                  You need to submit and get your business approved before you can create clearance deals.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  This helps us maintain a trusted marketplace for clearance deals. Your application will be reviewed within 24-48 hours.
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

  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-muted py-10">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-[32px] border border-muted-foreground bg-card p-8 shadow-lg shadow-enkaji-ink/5">
          <h1 className="text-3xl font-bold text-enkaji-ink">Create Clearance Deal</h1>
          <p className="mt-3 text-muted-foreground">Your business <strong>{business.businessName}</strong> is approved. Fill in the product details below.</p>
        </div>
        <div className="max-w-3xl">
          <ClearanceListingForm categories={categories} />
        </div>
      </main>
    </div>
  )
}
