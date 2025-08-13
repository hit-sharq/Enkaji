"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

const categories = [
  {
    id: "jewelry",
    name: "Traditional Jewelry",
    description: "Handcrafted beadwork and ornaments",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "150+ items",
    featured: true,
    color: "from-red-500 to-orange-500",
  },
  {
    id: "clothing",
    name: "Cultural Attire",
    description: "Authentic Masai clothing and fabrics",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "80+ items",
    featured: false,
    color: "from-blue-500 to-purple-500",
  },
  {
    id: "home-decor",
    name: "Home & Decor",
    description: "Beautiful crafts for your living space",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "120+ items",
    featured: true,
    color: "from-green-500 to-teal-500",
  },
  {
    id: "art",
    name: "Traditional Art",
    description: "Paintings, sculptures, and artwork",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "60+ items",
    featured: false,
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Bags, belts, and everyday items",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "90+ items",
    featured: false,
    color: "from-pink-500 to-red-500",
  },
  {
    id: "ceremonial",
    name: "Ceremonial Items",
    description: "Special occasion and ritual items",
    image: "/placeholder.svg?height=300&width=400",
    itemCount: "40+ items",
    featured: true,
    color: "from-indigo-500 to-purple-500",
  },
]

export function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-4 py-2 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Explore Categories
          </Badge>

          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Discover Authentic
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 block">
              Masai Crafts
            </span>
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each category represents centuries of cultural heritage and artistic excellence. Browse through our
            carefully curated collections of authentic Masai craftsmanship.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {categories.map((category) => (
            <Card
              key={category.id}
              className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${
                category.featured ? "md:col-span-1 lg:col-span-1" : ""
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Gradient Overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  {/* Featured Badge */}
                  {category.featured && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-white/90 text-gray-900 hover:bg-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Item Count */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/80">
                      {category.itemCount}
                    </Badge>
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-playfair text-xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90 mb-4">{category.description}</p>
                      <Button
                        asChild
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
                      >
                        <Link href={`/categories/${category.id}`}>
                          Explore
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Card Footer - Always Visible */}
                <div className="p-6">
                  <h3 className="font-playfair text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{category.itemCount}</span>
                    <ArrowRight
                      className={`w-4 h-4 text-gray-400 transition-all duration-300 ${
                        hoveredCategory === category.id ? "text-orange-600 translate-x-1" : ""
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 group bg-transparent"
          >
            <Link href="/categories">
              View All Categories
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
