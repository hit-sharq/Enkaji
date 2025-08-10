import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductForm } from "@/components/dashboard/product-form"
import { db } from "@/lib/db"

async function getCategories() {
  return await db.category.findMany({
    orderBy: { name: "asc" },
  })
}

export default async function NewProductPage() {
  const user = await getCurrentUser()

  if (!user || (user.role !== "SELLER" && user.role !== "ADMIN")) {
    redirect("/")
  }

  if (user.role === "SELLER" && !user.sellerProfile?.isVerified) {
    redirect("/dashboard")
  }

  const categories = await getCategories()

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="font-playfair text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
            <p className="text-gray-600">Create a new product listing for your craft</p>
          </div>
          <ProductForm categories={categories} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
