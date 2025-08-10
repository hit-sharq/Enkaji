import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { isUserAdmin } from "@/lib/auth"

export default async function AdminPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, products, and monitor platform performance</p>
      </div>
      <AdminDashboard user={{ id: userId }} />
    </div>
  )
}
