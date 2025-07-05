import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-red-900 via-red-800 to-orange-700 text-white overflow-hidden">
      <div className="absolute inset-0 enkaji-pattern opacity-10"></div>
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Authentic Masai
            <span className="block text-yellow-300">Handmade Crafts</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-2xl mx-auto">
            Discover unique, culturally-rich pieces crafted by talented Masai artisans in Kenya. Every purchase supports
            local communities and preserves traditional craftsmanship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop">
              <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-3">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-red-800 px-8 py-3 bg-transparent"
              >
                Our Story
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
  )
}
