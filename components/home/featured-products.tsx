"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, ShoppingCart } from "lucide-react"
import Link from "next/link"

const featuredProducts = [
  {
    id: 1,
    name: "Handwoven Kente Cloth",
    price: 89.99,
    originalPrice: 120.0,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?height=300&width=300",
    seller: "Akosua Crafts",
    badge: "Bestseller",
    badgeColor: "bg-enkaji-red",
  },
  {
    id: 2,
    name: "Carved Wooden Mask",
    price: 45.99,
    rating: 4.9,
    reviews: 89,
    image: "/placeholder.svg?height=300&width=300",
    seller: "Heritage Arts",
    badge: "Featured",
    badgeColor: "bg-enkaji-green",
  },
  {
    id: 3,
    name: "Beaded Jewelry Set",
    price: 32.99,
    originalPrice: 45.0,
    rating: 4.7,
    reviews: 156,
    image: "/placeholder.svg?height=300&width=300",
    seller: "Maasai Beads Co",
    badge: "Sale",
    badgeColor: "bg-enkaji-ochre",
  },
  {
    id: 4,
    name: "Traditional Pottery",
    price: 28.99,
    rating: 4.6,
    reviews: 67,
    image: "/placeholder.svg?height=300&width=300",
    seller: "Clay Masters",
    badge: "New",
    badgeColor: "bg-enkaji-gold",
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-enkaji-ochre to-enkaji-brown bg-clip-text text-transparent">
              Featured Products
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked treasures from our most talented artisans
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className={`absolute top-3 left-3 ${product.badgeColor} text-white`}>{product.badge}</Badge>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                {product.originalPrice && (
                  <div className="absolute bottom-3 left-3 bg-enkaji-red text-white px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.seller}</p>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating) ? "text-enkaji-gold fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.reviews})</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-enkaji-red">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>

                <Button className="w-full bg-enkaji-red hover:bg-enkaji-red/90 text-white group/btn">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                  Add to Cart
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
            className="border-enkaji-ochre text-enkaji-ochre hover:bg-enkaji-ochre hover:text-white bg-transparent"
          >
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
