import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { SellerDashboard } from "@/components/dashboard/seller-dashboard"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UserRole } from "@prisma/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  let user
  let authError = false

  try {
    user = await getCurrentUser()
  } catch (error) {
    console.error("Dashboard: Failed to get current user:", error)
    authError = true
  }

  // If there's an auth error, show error page instead of redirecting
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Authentication Service Unavailable</strong>
              <br />
              We're experiencing connectivity issues with our authentication service. Please try again in a few moments
              or contact support if the issue persists.
              <br />
              <br />
              <strong>Possible solutions:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Check your internet connection</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try signing out and signing back in</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    redirect("/sign-in")
  }

  // Transform the database user to match component expectations
  const transformedUser = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    imageUrl: user.imageUrl,
    role: user.role,
    sellerProfile: user.sellerProfile
      ? {
          isVerified: user.sellerProfile.isVerified,
          businessName: user.sellerProfile.businessName,
          businessType: user.sellerProfile.businessType,
          description: user.sellerProfile.description,
        }
      : null,
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.ADMIN:
        return <AdminDashboard user={transformedUser} />
      case UserRole.SELLER:
        return <SellerDashboard user={transformedUser} />
      default:
        return <BuyerDashboard user={transformedUser} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">{renderDashboard()}</main>
      <Footer />
    </div>
  )
}
