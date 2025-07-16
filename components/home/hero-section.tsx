import { Button } from "@/components/ui/button"
import { ArrowRight, Search } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-bold text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight">
            Global Marketplace for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Everything
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Connect with millions of suppliers worldwide. Find products, compare prices, and grow your business on the
            world's leading B2B platform.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Input
                placeholder="Search for products, suppliers, or categories..."
                className="h-14 pl-12 pr-4 text-lg bg-white text-gray-900 border-0 rounded-full shadow-lg"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Button className="absolute right-2 top-2 h-10 px-6 bg-orange-500 hover:bg-orange-600 rounded-full">
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-full">
                Start Shopping
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg rounded-full bg-transparent"
              >
                Become a Seller
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-400">10M+</div>
              <div className="text-blue-200">Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">200K+</div>
              <div className="text-blue-200">Suppliers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">190+</div>
              <div className="text-blue-200">Countries</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
