"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowUpRight } from "lucide-react"
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
  <section className="bg-background py-16 md:py-24">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-10 text-center md:mb-14">
        <div className="mx-auto mb-3 h-10 w-80 animate-pulse rounded-lg bg-muted md:h-12 md:w-96" />
        <div className="mx-auto h-4 w-64 animate-pulse rounded-lg bg-muted md:h-6 md:w-80" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-muted md:col-span-2 md:row-span-1" />
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

  const bentoCards = useMemo(() => {
    if (categories.length === 0) return null
    const [first, ...rest] = categories
    return { first, rest }
  }, [categories])

  if (loading) {
    return <CategoriesSkeleton />
  }

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enkaji-eyebrow mb-2 md:mb-4">Browse by Sector</p>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              <span className="enkaji-gradient-text">Business Categories</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground md:text-base">
            Find sellers and products across Kenya&apos;s key business sectors.
          </p>
        </div>

        {bentoCards && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5">
            {/* Featured large card */}
            <Card
              key={bentoCards.first.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-enkaji-orange to-enkaji-charcoal text-white transition-all duration-300 hover:shadow-xl md:col-span-2 md:row-span-2"
            >
              <CardContent className="flex h-full flex-col justify-between p-6 md:p-8">
                <div>
                  <span className="mb-4 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    {bentoCards.first._count?.products ?? 0} Products
                  </span>
                  <h3 className="font-display text-2xl font-bold md:text-3xl">
                    {bentoCards.first.name}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-white/70 md:text-base">
                    {bentoCards.first.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="mt-6 w-fit rounded-full bg-enkaji-orange font-semibold text-enkaji-ink hover:bg-enkaji-orange/90"
                >
                  <Link href={`/categories/${bentoCards.first.slug}`}>
                    Explore
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Smaller cards */}
            {bentoCards.rest.map((category) => (
              <Card
                key={category.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-enkaji-orange/30 hover:shadow-elevated"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <span className="enkaji-badge border border-enkaji-orange/20 bg-enkaji-orange/5 text-enkaji-orange">
                      {category._count?.products ?? 0}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-enkaji-orange" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold text-foreground">
                    {category.name}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-10 text-center md:mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-enkaji-orange/30 px-7 py-6 font-semibold text-enkaji-orange hover:bg-enkaji-orange/5"
          >
            <Link href="/categories">
              Browse All Sectors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
