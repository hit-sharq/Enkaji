"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, MapPin, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

interface HomeStats {
  products: number
  categories: number
  sellers: number
  counties: number
}

export function StatsSection() {
  const [stats, setStats] = useState<HomeStats>({
    products: 0,
    categories: 0,
    sellers: 0,
    counties: 47,
  })

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?limit=1"),
          fetch("/api/categories?limit=1"),
        ])
        if (prodRes.ok) {
          const data = await prodRes.json()
          setStats((s) => ({ ...s, products: data.total || 0 }))
        }
        if (catRes.ok) {
          const data = await catRes.json()
          setStats((s) => ({ ...s, categories: Array.isArray(data) ? data.length : 0 }))
        }
      } catch {
        // keep defaults
      }
    }
    load()
  }, [])

  const items = [
    {
      icon: Package,
      value: stats.products > 0 ? stats.products.toLocaleString() : "Growing",
      label: "Product Listings",
      description: "Quality stock from verified sellers",
    },
    {
      icon: Users,
      value: stats.categories > 0 ? stats.categories.toString() : "Expanding",
      label: "Business Sectors",
      description: "Across every major category",
    },
    {
      icon: MapPin,
      value: "47",
      label: "Counties Covered",
      description: "Nationwide reach across Kenya",
    },
    {
      icon: TrendingUp,
      value: "New",
      label: "Platform Launch",
      description: "Fresh start, big opportunities",
    },
  ]

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-12">
          <p className="enkaji-eyebrow mb-2 md:mb-4">Our Platform</p>
          <h2 className="mb-2 font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl lg:text-4xl">
            Building Kenya&apos;s Premier B2B Marketplace
          </h2>
          <p className="mx-auto max-w-2xl px-2 text-sm text-muted-foreground md:text-base md:px-0">
            We&apos;re just getting started, but our vision is big. Join us as we build something amazing for Kenyan
            businesses.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-6">
          {items.map((stat, index) => (
            <Card
              key={index}
              className="enkaji-card text-center"
            >
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-enkaji-orange to-enkaji-charcoal">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="mb-2 font-display text-2xl font-bold text-foreground md:text-3xl">{stat.value}</h3>
                <p className="mb-2 font-semibold text-foreground/80">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-3xl rounded-2xl border border-enkaji-orange/20 bg-enkaji-orange/5">
            <CardContent className="p-6 md:p-8">
              <h3 className="mb-4 font-display text-2xl font-bold text-foreground">
                Be Part of Our Growth Story
              </h3>
              <p className="mb-6 text-muted-foreground">
                Join Enkaji Trade Kenya today and help us build Kenya&apos;s most trusted B2B marketplace. Whether you&apos;re
                buying or selling, your success is our success.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <a
                  href="/sign-up"
                  className="rounded-xl bg-enkaji-orange px-6 py-3 font-semibold text-white transition-colors hover:bg-enkaji-orange/90"
                >
                  Join as Buyer
                </a>
                <a
                  href="/sell"
                  className="rounded-xl border border-enkaji-orange/30 px-6 py-3 font-semibold text-enkaji-orange transition-colors hover:bg-enkaji-orange/5"
                >
                  Start Selling
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
