import { Card, CardContent } from "@/components/ui/card"
import {
  Smartphone,
  Shirt,
  Home,
  Wrench,
  Car,
  Gamepad2,
  Heart,
  Book,
  Laptop,
  Watch,
  Camera,
  Headphones,
} from "lucide-react"
import Link from "next/link"

const categories = [
  { name: "Electronics", icon: Smartphone, slug: "electronics", color: "bg-blue-500" },
  { name: "Fashion", icon: Shirt, slug: "fashion", color: "bg-pink-500" },
  { name: "Home & Garden", icon: Home, slug: "home-garden", color: "bg-green-500" },
  { name: "Tools & Hardware", icon: Wrench, slug: "tools", color: "bg-gray-600" },
  { name: "Automotive", icon: Car, slug: "automotive", color: "bg-red-500" },
  { name: "Sports & Gaming", icon: Gamepad2, slug: "sports-gaming", color: "bg-purple-500" },
  { name: "Health & Beauty", icon: Heart, slug: "health-beauty", color: "bg-rose-500" },
  { name: "Books & Media", icon: Book, slug: "books-media", color: "bg-amber-500" },
  { name: "Computers", icon: Laptop, slug: "computers", color: "bg-indigo-500" },
  { name: "Watches", icon: Watch, slug: "watches", color: "bg-yellow-600" },
  { name: "Photography", icon: Camera, slug: "photography", color: "bg-teal-500" },
  { name: "Audio", icon: Headphones, slug: "audio", color: "bg-orange-500" },
]

export function CategoriesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover millions of products across hundreds of categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
