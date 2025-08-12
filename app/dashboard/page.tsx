import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { SellerDashboard } from "@/components/dashboard/seller-dashboard"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UserRole } from "@prisma/client"

export default async function DashboardPage() {
  const user = await getCurrentUser()

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
