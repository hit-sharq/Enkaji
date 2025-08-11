import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { SellerDashboard } from "@/components/dashboard/seller-dashboard"
import { ArtisanDashboard } from "@/components/dashboard/artisan-dashboard"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "ADMIN":
        return <AdminDashboard user={user} />
      case "SELLER":
        return <SellerDashboard user={user} />
      case "ARTISAN":
        return <ArtisanDashboard user={user} />
      default:
        return <BuyerDashboard user={user} />
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
