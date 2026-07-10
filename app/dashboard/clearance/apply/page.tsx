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
    <div className="min-h-screen bg-slate-50 py-10">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
          <h1 className="text-3xl font-bold text-slate-900">Clearance Deals Program</h1>
          <p className="mt-3 text-slate-600">
            Want to list clearance deals on our marketplace? Submit your business details below. Our team will review your application and you'll be able to post clearance listings once approved.
          </p>
        </div>

        <div className="max-w-3xl space-y-6">
          {existingRequest && (
            <Card className="rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Application Status</CardTitle>
                    <CardDescription>Business: {existingRequest.businessName}</CardDescription>
                  </div>
                  {existingRequest.isApproved ? (
                    <Badge className="bg-green-100 text-green-700">
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
                  <p className="text-sm text-red-600">Reason: {existingRequest.rejectionReason}</p>
                </CardContent>
              )}
            </Card>
          )}

          {!existingRequest || !existingRequest.isApproved ? (
            <ClearanceBusinessForm />
          ) : (
            <Card className="rounded-2xl border-0 bg-green-50 shadow-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-900">You're Approved!</h3>
                <p className="text-green-700 mt-2">You can now create and manage clearance deals.</p>
                <a href="/dashboard/clearance" className="inline-block mt-4 px-6 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors">
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
