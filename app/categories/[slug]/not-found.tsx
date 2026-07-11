import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, ArrowLeft } from "lucide-react"

export default function CategoryNotFound() {
  return (
    <main>
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Sorry, we couldn't find the category you're looking for. It may have been moved or doesn't exist.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/categories">
                  <Button className="bg-enkaji-ochre hover:bg-enkaji-ochre/90">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Browse All Categories
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline">View All Products</Button>
                </Link>
              </div>

              <div className="mt-12 p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Popular Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Link href="/categories/electronics" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Electronics & Technology
                  </Link>
                  <Link href="/categories/fashion-apparel" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Fashion & Apparel
                  </Link>
                  <Link href="/categories/agriculture" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Agriculture & Food
                  </Link>
                  <Link href="/categories/construction" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Construction Materials
                  </Link>
                  <Link href="/categories/automotive" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Automotive
                  </Link>
                  <Link href="/categories/home-garden" className="text-enkaji-ochre hover:text-enkaji-ochre/90">
                    Home & Garden
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  )
}
