"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Users, Globe } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-enkaji-red/10 via-enkaji-ochre/5 to-enkaji-brown/10">
        <div className="absolute top-20 left-10 w-20 h-20 bg-enkaji-gold/20 rounded-full animate-pulse will-change-transform"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-enkaji-green/20 rounded-full animate-bounce delay-300 will-change-transform"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-enkaji-ochre/20 rounded-full animate-pulse delay-700 will-change-transform"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-enkaji-cream/80 backdrop-blur-sm px-4 py-2 rounded-full border border-enkaji-gold/30">
              <Globe className="w-4 h-4 text-enkaji-red" />
              <span className="text-sm font-medium text-enkaji-brown">Kenya's Premier B2B Marketplace</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown bg-clip-text text-transparent">
                  Enkaji Trade Kenya
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                Connect with verified suppliers, discover quality products, and grow your business through Kenya's most
                trusted B2B marketplace platform.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-enkaji-red">50K+</div>
                <div className="text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-enkaji-ochre">5K+</div>
                <div className="text-sm text-gray-600">Suppliers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-enkaji-green">47</div>
                <div className="text-sm text-gray-600">Counties</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-enkaji-red hover:bg-enkaji-red/90 text-white group">
                <Link href="/shop">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Find Suppliers
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-enkaji-brown text-enkaji-brown hover:bg-enkaji-brown hover:text-white bg-transparent"
              >
                <Link href="/sell">
                  <Users className="w-5 h-5 mr-2" />
                  Register as Supplier
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-enkaji-cream to-enkaji-gold/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <div className="flex items-center gap-2 justify-center mb-4">
                    <div className="w-8 h-8 bg-enkaji-green rounded-full"></div>
                    <div>
                      <div className="text-sm font-medium">Active RFQs</div>
                      <div className="text-xs text-gray-600">1,247 active</div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">⭐ 4.9/5</div>
                  <div className="text-xs text-gray-600">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
