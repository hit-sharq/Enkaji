"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Smartphone,
  Shirt,
  Home,
  Car,
  Wrench,
  Heart,
  Gamepad2,
  Book,
  Wheat,
  HardHat,
  Palette,
  Zap,
  Monitor,
  Factory,
  Truck,
  Shield,
  Sun,
  GraduationCap,
} from "lucide-react"
import { useEffect, useState } from "react"

interface Category {
  id: string
  name: string
  slug: string
  _count: {
    products: number
  }
}

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  "computers-it": Monitor,
  "mobile-phones": Smartphone,
  "home-appliances": Home,
  "fashion-apparel": Shirt,
  "textiles-fabrics": Palette,
  "footwear-leather": Shirt,
  "jewelry-accessories": Heart,
  agriculture: Wheat,
  "agriculture-farming": Wheat,
  "food-beverages": Wheat,
  "livestock-feed": Wheat,
  "seeds-fertilizers": Wheat,
  "construction-materials": HardHat,
  "tools-hardware": Wrench,
  "plumbing-electrical": Zap,
  "heavy-machinery": Factory,
  "automotive-parts": Car,
  "vehicles-transport": Truck,
  "tires-wheels": Car,
  "health-medical": Heart,
  "beauty-personal-care": Heart,
  pharmaceuticals: Heart,
  "furniture-decor": Home,
  "office-supplies": Book,
  "kitchen-dining": Home,
  "industrial-equipment": Factory,
  "chemicals-materials": Factory,
  "packaging-printing": Factory,
  "sports-recreation": Gamepad2,
  "outdoor-camping": Gamepad2,
  "education-training": GraduationCap,
  "books-stationery": Book,
  "solar-renewable": Sun,
  "generators-power": Zap,
  "security-safety": Shield,
  "arts-crafts": Palette,
  "traditional-crafts": Palette,
  "wood-carvings": Wrench,
  "pottery-ceramics": Palette,
  metalwork: Factory,
  "leather-goods": Shirt,
  "baskets-weaving": Palette,
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.slice(0, 12)) // Show first 12 categories
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Loading categories...</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover millions of products across all major business categories from verified Kenyan artisans and
            businesses
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.slug] || Factory
            return (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{category.name}</h3>
                    <p className="text-xs text-gray-500">{category._count.products} products</p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-8">
          <Link href="/categories">
            <Button variant="outline" className="px-8 py-3 bg-transparent">
              View All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
