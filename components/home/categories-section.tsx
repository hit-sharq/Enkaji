"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const categories = [
  {
    name: "Fashion & Apparel",
    description: "Traditional and modern African clothing",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-red to-enkaji-ochre",
    href: "/categories/fashion-apparel",
  },
  {
    name: "Home & Garden",
    description: "Handcrafted home decor and furniture",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-ochre to-enkaji-brown",
    href: "/categories/home-garden",
  },
  {
    name: "Electronics",
    description: "Modern tech solutions",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-brown to-enkaji-green",
    href: "/categories/electronics",
  },
  {
    name: "Agriculture",
    description: "Fresh produce and farming tools",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-green to-enkaji-gold",
    href: "/categories/agriculture",
  },
  {
    name: "Construction",
    description: "Building materials and tools",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-gold to-enkaji-red",
    href: "/categories/construction",
  },
  {
    name: "Automotive",
    description: "Vehicle parts and accessories",
    image: "/placeholder.svg?height=300&width=400",
    color: "from-enkaji-red to-enkaji-brown",
    href: "/categories/automotive",
  },
]

export function CategoriesSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-enkaji-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-enkaji-red to-enkaji-ochre bg-clip-text text-transparent">
              Explore Categories
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover a world of authentic African products across diverse categories
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card
              key={category.name}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-20`}></div>
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Button
                  asChild
                  variant="ghost"
                  className="p-0 h-auto text-enkaji-red hover:text-enkaji-red/80 group/btn"
                >
                  <Link href={category.href}>
                    Explore Category
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-enkaji-red text-enkaji-red hover:bg-enkaji-red hover:text-white bg-transparent"
          >
            <Link href="/categories">
              View All Categories
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
