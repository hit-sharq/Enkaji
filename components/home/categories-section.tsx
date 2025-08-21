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

const categoryColors = [
  "from-enkaji-red to-enkaji-ochre",
  "from-enkaji-ochre to-enkaji-brown",
  "from-enkaji-brown to-enkaji-green",
  "from-enkaji-green to-enkaji-gold",
  "from-enkaji-gold to-enkaji-red",
  "from-enkaji-red to-enkaji-brown",
]

const CategoriesSkeleton = () => (
  <section className="py-20 bg-gradient-to-b from-white to-enkaji-cream/30">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <div className="h-12 bg-gray-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-80 mx-auto animate-pulse"></div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="overflow-hidden border-0 shadow-lg">
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            </CardContent>
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
      categories.map((category, index) => (
        <Card
          key={category.id}
          className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
        >
          <div className="relative h-48 overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} opacity-80`}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-bold text-white text-center px-4">{category.name}</h3>
            </div>
            {category._count && (
              <div className="absolute bottom-3 right-3 bg-white/90 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                {category._count.products} products
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-4">{category.description}</p>
            <Button asChild variant="ghost" className="p-0 h-auto text-enkaji-red hover:text-enkaji-red/80 group/btn">
              <Link href={`/categories/${category.slug}`}>
                Explore Category
                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )),
    [categories],
  )

  if (loading) {
    return <CategoriesSkeleton />
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-enkaji-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-enkaji-red to-enkaji-ochre bg-clip-text text-transparent">
              Business Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find suppliers and products across Kenya's key business sectors
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{categoryCards}</div>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-enkaji-red text-enkaji-red hover:bg-enkaji-red hover:text-white bg-transparent"
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
