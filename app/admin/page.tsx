import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

async function isUserAdmin(userEmail: string): Promise<boolean> {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",") || []
  return adminEmails.includes(userEmail)
}

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const userIsAdmin = await isUserAdmin(user.email)

  if (!userIsAdmin) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
              <p className="text-sm text-gray-500">If you believe this is an error, please contact support.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage Enkaji marketplace</p>
          </div>
        </div>
        <AdminDashboard user={user} />
      </main>
      <Footer />
    </div>
  )
}
