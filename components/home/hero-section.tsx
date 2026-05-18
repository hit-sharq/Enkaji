"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Users, Globe } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-enkaji-red/10 via-enkaji-ochre/5 to-enkaji-brown/10">
        <div className="absolute top-12 left-4 w-12 h-12 md:top-20 md:left-10 md:w-20 md:h-20 bg-enkaji-gold/20 rounded-full animate-pulse will-change-transform"></div>
        <div className="absolute top-20 right-4 w-10 h-10 md:top-40 md:right-20 md:w-16 md:h-16 bg-enkaji-green/20 rounded-full animate-bounce will-change-transform"></div>
        <div className="absolute bottom-20 left-4 w-8 h-8 md:bottom-40 md:left-20 md:w-12 md:h-12 bg-enkaji-ochre/20 rounded-full animate-pulse will-change-transform"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 py-10 md:py-0">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-center">
          {/* Content */}
          <div className="space-y-4 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-enkaji-cream/80 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-enkaji-gold/30">
              <Globe className="w-3 h-3 md:w-4 md:h-4 text-enkaji-red" />
              <span className="text-xs md:text-sm font-medium text-enkaji-brown">Kenya&#39;s Premier B2B Marketplace</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-2 md:space-y-4 pr-2">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown bg-clip-text text-transparent">
                  Enkaji Trade Kenya
                </span>
              </h1>
              <p className="text-sm md:text-xl text-gray-600 dark:text-gray-300 max-w-lg">
                Connect with verified sellers, discover quality products, and grow your business through Kenya&#39;s most
                trusted B2B marketplace platform.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 md:gap-8">
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-enkaji-red">50K+</div>
                <div className="text-[10px] md:text-sm text-gray-600">Products</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-enkaji-ochre">5K+</div>
                <div className="text-[10px] md:text-sm text-gray-600">Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-lg md:text-2xl font-bold text-enkaji-green">47</div>
                <div className="text-[10px] md:text-sm text-gray-600">Counties</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
              <Button asChild size="sm" className="bg-enkaji-red hover:bg-enkaji-red/90 text-white group w-full sm:w-auto md:h-10 md:px-5">
                <Link href="/shop">
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Find Shops
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-enkaji-brown text-enkaji-brown hover:bg-enkaji-brown hover:text-white bg-transparent w-full sm:w-auto md:h-10 md:px-5"
              >
                <Link href="/sell">
                  <Users className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Register as a Seller
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative mt-6 lg:mt-0">
            <div className="relative w-full h-56 md:h-96 lg:h-[500px] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl bg-gradient-to-br from-enkaji-cream to-enkaji-gold/20 flex items-center justify-center">
              <div className="text-center p-4 md:p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 md:p-6 shadow-lg max-w-[280px] md:max-w-none">
                  <div className="flex items-center gap-2 justify-center mb-3 md:mb-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-enkaji-green rounded-full"></div>
                    <div>
                      <div className="text-xs md:text-sm font-medium">Active RFQs</div>
                      <div className="text-[10px] md:text-xs text-gray-600">1,247 active</div>
                    </div>
                  </div>
                  <div className="text-sm md:text-base font-medium">⭐ 4.9/5</div>
                  <div className="text-[10px] md:text-xs text-gray-600">Customer Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
