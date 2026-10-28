"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"

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
  <section className="bg-background py-16 md:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-8 flex items-end justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  </section>
)

const categoryIcons: Record<string, string> = {}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories?limit=12")
      if (response.ok) {
        const data = await response.json()
        setCategories(Array.isArray(data) ? data : data.categories ?? [])
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

  if (loading) {
    return <CategoriesSkeleton />
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="enkaji-eyebrow mb-2">Browse by Sector</p>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Shop by Category
            </h2>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit rounded-full border-enkaji-orange/30 text-enkaji-orange hover:bg-enkaji-orange/5">
            <Link href="/categories">
              View All
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.slice(0, 12).map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group h-full border border-border/60 bg-card shadow-card transition-all duration-200 hover:border-enkaji-orange/40 hover:shadow-card-hover hover:-translate-y-0.5">
                <CardContent className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-enkaji-orange/10 text-enkaji-orange transition-colors duration-200 group-hover:bg-enkaji-orange group-hover:text-white">
                    <span className="font-display text-sm font-bold">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 font-display text-xs font-semibold text-foreground group-hover:text-enkaji-orange transition-colors">
                    {category.name}
                  </h3>
                  {category._count?.products !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      {category._count.products} items
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
