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
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-card border-b border-border py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="enkaji-eyebrow mb-3 block">All Categories</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">Browse All Categories</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover products across all major categories from verified sellers nationwide
              </p>

              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search categories..."
                    className="w-full pl-12 pr-4 h-12 text-base rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || Factory
                return (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className="group h-full border border-border/60 bg-card shadow-card hover:border-enkaji-orange/40 hover:shadow-card-hover transition-all duration-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-enkaji-orange/10 flex items-center justify-center group-hover:bg-enkaji-orange transition-colors duration-200">
                            <IconComponent className="w-6 h-6 text-enkaji-orange group-hover:text-white transition-colors duration-200" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-enkaji-orange group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="font-display font-semibold text-foreground mb-1 group-hover:text-enkaji-orange transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{category._count.products} products available</p>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}

              {categories.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Factory className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">No Categories Found</h3>
                  <p className="text-muted-foreground mb-6">Categories are being set up. Please check back soon.</p>
                  <Link href="/shop">
                    <Button>Browse All Products</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="enkaji-eyebrow mb-3 block">Need Something?</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground mb-3">Can't Find What You're Looking For?</h2>
              <p className="text-muted-foreground mb-6">Submit a request for quotation and let sellers come to you</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="px-8">Post Buying Request</Button>
                <Button variant="outline" className="border-enkaji-orange/40 text-enkaji-orange hover:bg-enkaji-orange/5">
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
