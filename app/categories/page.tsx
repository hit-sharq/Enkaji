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
        {/* Hero Section — dark showcase band */}
        <section className="bg-enkaji-ink text-enkaji-ivory py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="enkaji-eyebrow mb-4 block">All Categories</span>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">Browse All Categories</h1>
              <p className="text-lg text-enkaji-ivory/80 mb-10">
                Discover products across all major categories from verified sellers nationwide
              </p>

              {/* Search */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-enkaji-gold w-5 h-5" />
                  <Input
                    placeholder="Search categories..."
                    className="w-full pl-14 pr-4 h-12 text-lg border-0 bg-enkaji-ivory/10 text-enkaji-ivory placeholder:text-enkaji-ivory/50 focus:ring-enkaji-gold rounded-full"
                  />
                  <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-6 bg-enkaji-gold text-enkaji-ink font-semibold rounded-full">
                    Search
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-20 bg-enkaji-ink">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const IconComponent = categoryIcons[category.slug] || Factory
                return (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <Card className="group border border-enkaji-gold/20 bg-white/[0.04] rounded-xl hover:border-enkaji-gold/50 hover:bg-white/[0.06] transition h-full">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 border border-enkaji-gold/30 rounded-lg flex items-center justify-center mb-4 group-hover:border-enkaji-gold/50 transition-colors">
                          <IconComponent className="w-6 h-6 text-enkaji-gold" />
                        </div>
                        <h3 className="font-display font-semibold text-enkaji-ivory mb-2 group-hover:text-enkaji-gold transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-enkaji-ivory/60 mb-4">{category._count.products} products available</p>
                        <div className="flex items-center text-enkaji-gold text-sm font-medium">
                          Browse products
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-16">
                <div className="w-24 h-24 bg-white/[0.04] border border-enkaji-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Factory className="w-12 h-12 text-enkaji-ivory/50" />
                </div>
                <h3 className="text-xl font-display font-semibold text-enkaji-ivory mb-2">No Categories Found</h3>
                <p className="text-enkaji-ivory/60 mb-6">Categories are being set up. Please check back soon.</p>
                <Link href="/shop">
                  <Button>Browse All Products</Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="enkaji-eyebrow mb-4 block">Need Something?</span>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-lg text-muted-foreground mb-8">Submit a request for quotation and let suppliers come to you</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold px-8 py-3 shadow-lg">Post Buying Request</Button>
                <Button variant="outline" className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 px-8 py-3">
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
