import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { BuyerDashboard } from "@/components/dashboard/buyer-dashboard"
import { SellerDashboard } from "@/components/dashboard/seller-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {user.role === "BUYER" && <BuyerDashboard user={user} />}
        {user.role === "SELLER" && <SellerDashboard user={user} />}
        {user.role === "ADMIN" && <AdminDashboard user={user} />}
      </main>
      <Footer />
    </div>
  )
}
