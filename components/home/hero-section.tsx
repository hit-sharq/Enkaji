"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, ShoppingBag, Users, Globe, ShieldCheck, Search, Package, Building2 } from "lucide-react"
import Link from "next/link"
import { memo } from "react"

const marqueeItems = [
  "Electronics & Tech",
  "Fashion & Apparel",
  "Agriculture",
  "Construction",
  "Automotive",
  "Food & Beverage",
  "Health & Medical",
  "Textiles",
]

export const HeroSection = memo(function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-enkaji-ink border-b border-border">
      <div className="container mx-auto relative z-10 px-4 py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          {/* Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-md border border-enkaji-orange/30 bg-enkaji-orange/10 px-3 py-1.5">
              <ShieldCheck className="h-4 w-4 text-enkaji-orange" />
              <span className="text-xs font-semibold uppercase tracking-wide text-enkaji-orange">
                Kenya's Liquidation & Seller Marketplace
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-enkaji-ivory md:text-5xl lg:text-6xl">
              Liquidate surplus stock.{" "}
              <span className="text-enkaji-orange">Sell more.</span>
              <br />
              Buy better.
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-enkaji-ivory/70 md:text-lg">
              Businesses clear slow-moving and surplus inventory at great prices. Sellers list
              and sell through our system. Buyers source quality stock with trade assurance.
            </p>

            {/* Search bar */}
            <form action="/shop" method="get" className="flex max-w-xl gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="search"
                  placeholder="Search products, suppliers, or categories…"
                  className="h-11 rounded-lg border-border bg-card pl-10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button type="submit" className="h-11 rounded-lg px-6">
                Search
              </Button>
            </form>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-lg">
                <Link href="/clearance">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Clearance Deals
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-lg border-enkaji-orange/40 bg-transparent text-enkaji-orange hover:bg-enkaji-orange/10">
                <Link href="/sell">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats panel */}
          <div className="grid grid-cols-2 gap-4 self-center">
            {[
              { icon: Building2, value: "5,000+", label: "Registered Sellers" },
              { icon: Package, value: "50K+", label: "Products Listed" },
              { icon: Globe, value: "47", label: "Counties Covered" },
              { icon: Users, value: "KSh 2B+", label: "Trade Volume" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <stat.icon className="h-5 w-5 text-enkaji-orange mb-3" />
                <div className="font-display text-2xl font-bold text-enkaji-ivory">{stat.value}</div>
                <div className="text-xs text-enkaji-ivory/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category strip */}
        <div className="container mx-auto px-4 mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-enkaji-ivory/60">
            <span className="text-enkaji-ivory/40 uppercase text-xs tracking-wide font-semibold">Browse:</span>
            {marqueeItems.map((item) => (
              <Link key={item} href={`/shop?category=${encodeURIComponent(item)}`} className="hover:text-enkaji-orange transition-colors">
                {item}
              </Link>
            ))}
            <Link href="/categories" className="text-enkaji-orange hover:underline">View all →</Link>
          </div>
        </div>
      </div>
    </section>
  )
})
