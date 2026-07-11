"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag, Users, Globe } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-enkaji-ink via-enkaji-forest to-enkaji-ink">
      {/* Ambient gold glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-enkaji-gold/10 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full bg-enkaji-gold/[0.06] blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-0">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-enkaji-gold/10 backdrop-blur-sm px-4 py-2 rounded-full border border-enkaji-gold/30">
              <Globe className="w-4 h-4 text-enkaji-gold" />
              <span className="enkaji-eyebrow">Kenya&apos;s Premier B2B Marketplace</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold leading-[1.05] text-enkaji-ivory">
                Trade with <span className="text-enkaji-gold italic">purpose</span>,<br />
                grow with <span className="text-enkaji-gold">Enkaji</span>
              </h1>
              <p className="text-base md:text-lg text-enkaji-ivory/70 max-w-lg leading-relaxed">
                Connect with verified sellers, discover quality products, and grow your business through Kenya&apos;s most
                trusted B2B marketplace platform.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="text-2xl md:text-3xl font-display font-semibold text-enkaji-gold">50K+</div>
                <div className="text-xs text-enkaji-ivory/50 tracking-wide">Products</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-display font-semibold text-enkaji-gold">5K+</div>
                <div className="text-xs text-enkaji-ivory/50 tracking-wide">Sellers</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-display font-semibold text-enkaji-gold">47</div>
                <div className="text-xs text-enkaji-ivory/50 tracking-wide">Counties</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold group w-full sm:w-auto">
                <Link href="/shop">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Find Shops
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent w-full sm:w-auto"
              >
                <Link href="/sell">
                  <Users className="w-5 h-5 mr-2" />
                  Register as a Seller
                </Link>
              </Button>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative mt-6 lg:mt-0">
            <div className="relative w-full h-72 md:h-96 lg:h-[480px] rounded-3xl overflow-hidden border border-enkaji-gold/20 bg-enkaji-ink/60 backdrop-blur-sm shadow-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="bg-enkaji-ivory/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl max-w-sm">
                  <div className="flex items-center gap-3 justify-center mb-4">
                    <div className="w-8 h-8 bg-enkaji-gold rounded-full"></div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-enkaji-ink">Active RFQs</div>
                      <div className="text-xs text-enkaji-brown/70">1,247 active</div>
                    </div>
                  </div>
                  <div className="text-2xl font-display font-semibold text-enkaji-ink">4.9 / 5</div>
                  <div className="text-xs text-enkaji-brown/70">Customer Rating</div>
                  <div className="mt-4 h-px bg-enkaji-gold/20" />
                  <div className="mt-4 text-xs text-enkaji-brown/70">Verified sellers across all 47 counties</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
})
