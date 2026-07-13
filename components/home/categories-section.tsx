"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useMemo, useCallback } from "react"

interface Category {
  id: string
  name: string
  description: string
  slug: string
  image?: string
  _count?: {
    products: number
  }
}

const CategoriesSkeleton = () => (
  <section className="py-12 md:py-20 bg-enkaji-ink">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 md:mb-16">
        <div className="h-10 md:h-12 bg-white/10 rounded-lg w-80 md:w-96 mx-auto mb-3 md:mb-4 animate-pulse"></div>
        <div className="h-4 md:h-6 bg-white/10 rounded-lg w-64 md:w-80 mx-auto animate-pulse"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="overflow-hidden border border-enkaji-gold/20 bg-white/[0.04] rounded-xl">
            <div className="p-6">
              <div className="h-3 w-16 bg-white/10 rounded mb-3 animate-pulse"></div>
              <div className="h-5 w-3/4 bg-white/10 rounded mb-3 animate-pulse"></div>
              <div className="h-3 w-full bg-white/10 rounded mb-2 animate-pulse"></div>
              <div className="h-3 w-2/3 bg-white/10 rounded mb-5 animate-pulse"></div>
              <div className="h-px w-full bg-enkaji-gold/10 mb-4"></div>
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </section>
)

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories?limit=6")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const categoryCards = useMemo(
    () =>
      categories.map((category) => (
        <Card
          key={category.id}
          className="group overflow-hidden border border-enkaji-gold/20 bg-white/[0.04] rounded-xl hover:border-enkaji-gold/50 hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent className="p-4 md:p-6">
            <p className="enkaji-eyebrow mb-2 md:mb-3">Sector</p>
            <h3 className="font-display text-lg md:text-2xl text-enkaji-ivory mb-1 md:mb-2 leading-tight">
              {category.name}
            </h3>
            <p className="text-enkaji-ivory/60 text-xs md:text-sm mb-3 md:mb-5 line-clamp-2">
              {category.description}
            </p>
            <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-enkaji-gold/15">
              <span className="inline-flex items-center text-[10px] md:text-xs tracking-[0.12em] uppercase text-enkaji-gold border border-enkaji-gold/30 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
                {category._count?.products ?? 0} Products
              </span>
              <Button
                asChild
                variant="ghost"
                className="p-0 h-auto text-xs md:text-sm text-enkaji-gold hover:text-enkaji-gold/80 group/btn"
              >
                <Link href={`/categories/${category.slug}`}>
                  Explore
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )),
    [categories],
  )

  if (loading) {
    return <CategoriesSkeleton />
  }

  return (
    <section className="py-12 md:py-20 bg-enkaji-ink">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-16">
          <p className="enkaji-eyebrow mb-2 md:mb-4">Browse by Sector</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 md:mb-4">
            <span className="enkaji-gradient-text">Business Categories</span>
          </h2>
          <p className="text-sm md:text-xl text-enkaji-ivory/70 max-w-2xl mx-auto px-2 md:px-0">
            Find sellers and products across Kenya's key business sectors
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">{categoryCards}</div>

        <div className="text-center mt-8 md:mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent"
          >
            <Link href="/categories">
              Browse All Sectors
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
