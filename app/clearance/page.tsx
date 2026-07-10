"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ClearanceCard } from "@/components/clearance/clearance-card"

interface Category {
  id: string
  name: string
}

interface ClearanceProduct {
  id: string
  name: string
  description?: string
  price: number
  comparePrice?: number | null
  inventory: number
  images: string[]
  category?: { name: string } | string | null
  clearanceEndDate?: string | null
  clearanceReason?: string | null
  clearanceViews?: number
}

const discountOptions = [
  { label: "All discounts", value: "all" },
  { label: "10%+ off", value: "10" },
  { label: "25%+ off", value: "25" },
  { label: "50%+ off", value: "50" },
  { label: "75%+ off", value: "75" },
]

export default function ClearancePage() {
  const [products, setProducts] = useState<ClearanceProduct[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDiscount, setSelectedDiscount] = useState("all")
  const [selectedReason, setSelectedReason] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch("/api/products?clearance=true&limit=48"),
          fetch("/api/categories"),
        ])

        const productData = await productsResponse.json()
        const categoryData = await categoriesResponse.json()

        setProducts(productData.products || [])
        setCategories(categoryData || [])
      } catch (error) {
        console.error("Failed to load clearance deals", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const reasons = useMemo(
    () => ["All reasons", "Overstock", "End of Season", "Warehouse Clearance", "Product Upgrade", "Business Closure", "Other"],
    [],
  )

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const categoryName = typeof product.category === "string" ? product.category : product.category?.name || ""
      const categoryMatch = selectedCategory === "all" || categoryName === selectedCategory
      const reasonMatch = selectedReason === "all" || product.clearanceReason === selectedReason

      const discount = product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0

      const discountMatch =
        selectedDiscount === "all" ||
        (selectedDiscount === "10" && discount >= 10) ||
        (selectedDiscount === "25" && discount >= 25) ||
        (selectedDiscount === "50" && discount >= 50) ||
        (selectedDiscount === "75" && discount >= 75)

      return nameMatch && categoryMatch && reasonMatch && discountMatch
    })
  }, [products, searchTerm, selectedCategory, selectedDiscount, selectedReason])

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <section className="relative overflow-hidden bg-[#0F172A] pb-20 pt-20 text-white">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-[#0F172A]/90 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-6">
              <Badge className="bg-[#F97316] text-white">Clearance Deals</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Move excess stock faster with premium clearance deals
              </h1>
              <p className="max-w-2xl text-lg text-slate-200">
                Browse deeply discounted inventory, end-of-season stock, and warehouse clearance offers that help sellers convert slow-moving stock into cash.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/clearance/new" className="inline-flex items-center rounded-full bg-[#F97316] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-[#F97316]/20 transition hover:bg-[#ea7b28]">
                  List Clearance Stock
                </Link>
                <Link href="/clearance" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                  Explore Deals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-100">
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.24em]">Filter stock in seconds</span>
                </div>
                <p className="text-sm leading-6 text-slate-200">
                  Use search, category and discount filters to find the best clearance buy for your business. Everything is built for speed and confidence.
                </p>
                <div className="rounded-[28px] border border-white/10 bg-white/10 p-5">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                        className="h-11 rounded-3xl border border-white/15 bg-[#0F172A]/90 px-4 text-sm text-white outline-none transition focus:border-[#F97316]"
                      >
                        <option value="all">All categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">Discount</label>
                      <select
                        value={selectedDiscount}
                        onChange={(event) => setSelectedDiscount(event.target.value)}
                        className="h-11 rounded-3xl border border-white/15 bg-[#0F172A]/90 px-4 text-sm text-white outline-none transition focus:border-[#F97316]"
                      >
                        {discountOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-slate-300">Reason</label>
                      <select
                        value={selectedReason}
                        onChange={(event) => setSelectedReason(event.target.value)}
                        className="h-11 rounded-3xl border border-white/15 bg-[#0F172A]/90 px-4 text-sm text-white outline-none transition focus:border-[#F97316]"
                      >
                        {reasons.map((reason) => (
                          <option key={reason} value={reason === "All reasons" ? "all" : reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-16 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Browse Clearance Stock</p>
              <h2 className="text-3xl font-bold text-slate-900">Discounted business inventory ready for checkout</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products, categories, reasons..."
                  className="pl-11"
                />
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
              <Button variant="outline" className="hidden sm:inline-flex gap-2 border-slate-300 text-slate-700 hover:border-[#0F172A] hover:text-[#0F172A]">
                <Sparkles className="h-4 w-4" />
                Top Deals
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 rounded-[32px] bg-white/70 p-6 shadow-lg shadow-slate-200/50 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center shadow-sm">
              <p className="text-xl font-semibold text-slate-900">No matching clearance deals found.</p>
              <p className="mt-3 text-slate-600">Try adjusting your filters or check back later for new stock.</p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredProducts.map((product) => (
                <ClearanceCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}
