import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { ClearanceBusinessForm } from "@/components/dashboard/clearance-business-form"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ClearanceApplyPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const existingRequest = await db.clearanceBusiness.findUnique({
    where: { userId: user.id },
  })

  return (
    <div className="min-h-screen bg-muted py-10">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-2xl border border-muted-foreground bg-card p-8 shadow-elevated shadow-enkaji-ink/5">
          <span className="enkaji-eyebrow mb-2 block">Clearance</span>
          <h1 className="font-display text-3xl font-bold tracking-tight text-enkaji-ink">Clearance Deals Program</h1>
          <p className="mt-3 text-muted-foreground">
            Want to list clearance deals on our marketplace? Submit your business details below. Our team will review your application and you'll be able to post clearance listings once approved.
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {existingRequest && (
            <Card className="rounded-2xl border-0 bg-card/80 backdrop-blur-sm shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                    <CardDescription>Business: {existingRequest.businessName}</CardDescription>
                  </div>
                  {existingRequest.isApproved ? (
                    <Badge className="bg-enkaji-orange text-enkaji-orange">
                      <CheckCircle className="h-3 w-3 mr-1" /> Approved
                    </Badge>
                  ) : existingRequest.rejectionReason ? (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" /> Rejected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" /> Pending
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {existingRequest.rejectionReason && (
                <CardContent>
                  <p className="text-sm text-enkaji-red">Reason: {existingRequest.rejectionReason}</p>
                </CardContent>
              )}
            </Card>
          )}

          {!existingRequest || !existingRequest.isApproved ? (
            <ClearanceBusinessForm />
          ) : (
            <Card className="rounded-2xl border-0 bg-enkaji-orange shadow-card">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-enkaji-orange mx-auto mb-4" />
                <h3 className="text-xl font-bold text-enkaji-orange">You're Approved!</h3>
                <p className="text-enkaji-orange mt-2">You can now create and manage clearance deals.</p>
                <a href="/dashboard/clearance" className="inline-block mt-4 px-6 py-2 rounded-xl bg-enkaji-orange text-white hover:bg-enkaji-orange transition-colors">
                  Go to Clearance Dashboard
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
