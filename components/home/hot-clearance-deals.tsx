"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ClearanceCard } from "@/components/clearance/clearance-card"
import { ArrowRight } from "lucide-react"

interface ProductCard {
  id: string
  name: string
  price: number
  comparePrice?: number | null
  inventory: number
  images: string[]
  category?: { name: string } | string | null
  clearanceEndDate?: string | null
  clearanceReason?: string | null
  clearanceViews?: number
}

export function HotClearanceDeals() {
  const [products, setProducts] = useState<ProductCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch("/api/products?clearance=true&limit=8")
        const data = await response.json()
        setProducts(data.products || [])
      } catch (error) {
        console.error("Failed to load clearance deals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDeals()
  }, [])

  return (
    <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enkaji-eyebrow mb-3">Hot Clearance Deals</p>
            <h2 className="mt-3 font-display text-3xl font-semibold sm:text-4xl text-enkaji-ivory">Top discounted inventory moving fast</h2>
            <p className="mt-3 max-w-2xl text-sm text-enkaji-ivory/70 md:text-base">
              Discover premium clearance stock across categories with heavy markdowns and fast delivery ready for business buyers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/clearance" className="inline-flex items-center gap-2 rounded-full border border-enkaji-gold/50 bg-enkaji-gold/10 px-4 py-3 text-sm font-semibold text-enkaji-gold transition hover:bg-enkaji-gold/20">
              Browse all clearance
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-96 rounded-[32px] bg-enkaji-ivory/5 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-[32px] border border-enkaji-gold/20 bg-enkaji-ivory/5 p-12 text-center text-enkaji-ivory/70">
            No hot clearance deals available right now.
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="-mx-4 overflow-x-auto pb-4 sm:-mx-6">
            <div className="flex gap-6 px-4 sm:px-6">
              {products.map((product) => (
                <div key={product.id} className="snap-start shrink-0">
                  <ClearanceCard product={product} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
