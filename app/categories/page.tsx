import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { db } from "@/lib/db"
import {
  Smartphone,
  Monitor,
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
  Factory,
  Truck,
  Shield,
  Sun,
  GraduationCap,
} from "lucide-react"

const categoryIcons: Record<string, any> = {
  electronics: Smartphone,
  "computers-it": Monitor,
  "mobile-phones": Smartphone,
  "home-appliances": Home,
  "fashion-apparel": Palette,
  "textiles-fabrics": Palette,
  "footwear-leather": Palette,
  "jewelry-accessories": Heart,
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
}

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: {
              isActive: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Browse All Categories</h1>
              <p className="text-xl mb-8 opacity-90">
                Discover products across all major categories from verified suppliers nationwide
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative bg-white rounded-full p-2">
                  <div className="flex items-center">
                    <Search className="absolute left-6 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search categories..."
                      className="flex-1 pl-14 pr-4 h-12 text-lg border-0 bg-transparent text-gray-900 focus:ring-0"
                    />
                    <Button className="h-10 px-6 bg-blue-600 hover:bg-blue-700 rounded-full">Search</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || Factory
                return (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {category.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-3">{category._count.products} products available</p>
                            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                              Browse products
                              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Factory className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
                <p className="text-gray-600 mb-6">Categories are being set up. Please check back soon.</p>
                <Link href="/shop">
                  <Button>Browse All Products</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-xl text-gray-600 mb-8">Submit a request for quotation and let suppliers come to you</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700 px-8 py-3">Post Buying Request</Button>
                <Button variant="outline" className="px-8 py-3 bg-transparent">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
