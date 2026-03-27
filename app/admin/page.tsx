import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { isUserAdmin } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Truck } from "lucide-react"
import Link from "next/link"
import { db } from "@/lib/db"

export default async function AdminPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Get the current user with all required fields
  const currentUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      imageUrl: true,
    },
  })

  if (!currentUser) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" className="mb-4 bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, products, and monitor platform performance</p>
        </div>
        <Link href="/admin/lumyn">
          <Button variant="outline" className="gap-2">
            <Truck className="w-4 h-4" />
            Lumyn Flow Admin
          </Button>
        </Link>
      </div>
      <AdminDashboard user={currentUser} />
    </div>
  )
}
