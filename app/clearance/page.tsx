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
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden bg-enkaji-ink pb-20 pt-20 text-enkaji-ivory">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-enkaji-ink/90 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div className="space-y-6">
              <Badge className="bg-enkaji-gold text-enkaji-ink">Clearance Deals</Badge>
              <h1 className="font-display font-semibold text-4xl tracking-tight sm:text-5xl">
                Move excess stock faster with premium clearance deals
              </h1>
              <p className="max-w-2xl text-lg text-enkaji-ivory/80">
                Browse deeply discounted inventory, end-of-season stock, and warehouse clearance offers that help sellers convert slow-moving stock into cash.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/clearance/new" className="inline-flex items-center rounded-full bg-enkaji-gold px-5 py-3 text-sm font-semibold text-enkaji-ink shadow-lg shadow-enkaji-gold/20 transition hover:bg-enkaji-gold/90">
                  List Clearance Stock
                </Link>
                <Link href="/clearance" className="inline-flex items-center gap-2 rounded-full border border-enkaji-gold/50 bg-enkaji-gold/10 px-5 py-3 text-sm font-semibold text-enkaji-gold transition hover:bg-enkaji-gold/20">
                  Explore Deals
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="rounded-[32px] border border-enkaji-gold/20 bg-enkaji-gold/5 p-8 shadow-2xl shadow-enkaji-ink/10 backdrop-blur-xl">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-enkaji-ivory/90">
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-[0.24em]">Filter stock in seconds</span>
                </div>
                <p className="text-sm leading-6 text-enkaji-ivory/80">
                  Use search, category and discount filters to find the best clearance buy for your business. Everything is built for speed and confidence.
                </p>
                <div className="rounded-[28px] border border-enkaji-gold/20 bg-enkaji-gold/10 p-5">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-enkaji-ivory/70">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(event) => setSelectedCategory(event.target.value)}
                        className="h-11 rounded-3xl border border-enkaji-gold/30 bg-enkaji-ink/90 px-4 text-sm text-enkaji-ivory outline-none transition focus:border-enkaji-gold"
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
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-enkaji-ivory/70">Discount</label>
                      <select
                        value={selectedDiscount}
                        onChange={(event) => setSelectedDiscount(event.target.value)}
                        className="h-11 rounded-3xl border border-enkaji-gold/30 bg-enkaji-ink/90 px-4 text-sm text-enkaji-ivory outline-none transition focus:border-enkaji-gold"
                      >
                        {discountOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <label className="text-sm font-medium uppercase tracking-[0.18em] text-enkaji-ivory/70">Reason</label>
                      <select
                        value={selectedReason}
                        onChange={(event) => setSelectedReason(event.target.value)}
                        className="h-11 rounded-3xl border border-enkaji-gold/30 bg-enkaji-ink/90 px-4 text-sm text-enkaji-ivory outline-none transition focus:border-enkaji-gold"
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Browse Clearance Stock</p>
              <h2 className="font-display text-3xl font-bold text-foreground">Discounted business inventory ready for checkout</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full max-w-sm">
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search products, categories, reasons..."
                  className="pl-11"
                />
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <Button variant="outline" className="hidden sm:inline-flex gap-2 border-border text-foreground hover:border-enkaji-gold hover:text-enkaji-gold">
                <Sparkles className="h-4 w-4" />
                Top Deals
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-96 rounded-[32px] bg-card p-6 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[32px] border border-border bg-card p-12 text-center shadow-sm">
              <p className="text-xl font-semibold text-foreground">No matching clearance deals found.</p>
              <p className="mt-3 text-muted-foreground">Try adjusting your filters or check back later for new stock.</p>
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
