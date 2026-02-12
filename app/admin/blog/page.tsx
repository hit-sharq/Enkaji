export const dynamic = 'force-dynamic'

import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { BlogManagement } from "@/components/admin/blog-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function AdminBlogPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline" className="mb-4 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
          <p className="text-gray-600">Create and manage blog posts</p>
        </div>
        <BlogManagement />
      </main>
    </div>
  )
}
