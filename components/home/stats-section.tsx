"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Package, MapPin, TrendingUp } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "Growing",
      label: "Active Sellers",
      description: "Businesses joining daily",
    },
    {
      icon: Package,
      value: "Expanding",
      label: "Product Listings",
      description: "New products added regularly",
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
    <section className="py-10 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <p className="enkaji-eyebrow mb-2 md:mb-4">Our Platform</p>
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground mb-2 md:mb-4">
            Building Kenya's Premier B2B Marketplace
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto px-2 md:px-0">
            We're just getting started, but our vision is big. Join us as we build something amazing for Kenyan
            businesses.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center border border-border bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                 <div className="w-16 h-16 bg-gradient-to-br from-enkaji-gold to-enkaji-ochre rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-enkaji-ivory" />
                </div>
                <h3 className="text-3xl font-bold text-foreground mb-2">{stat.value}</h3>
                <p className="font-semibold text-foreground/80 mb-2">{stat.label}</p>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
           <Card className="bg-enkaji-ink text-enkaji-ivory max-w-3xl mx-auto rounded-xl border border-enkaji-gold/20">
            <CardContent className="p-5 md:p-8">
              <h3 className="font-display text-2xl font-semibold mb-4">Be Part of Our Growth Story</h3>
              <p className="text-enkaji-ivory/70 mb-6">
                Join Enkaji Trade Kenya today and help us build Kenya's most trusted B2B marketplace. Whether you're
                buying or selling, your success is our success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/sign-up"
                  className="bg-enkaji-gold text-enkaji-ink px-6 py-3 rounded-lg font-semibold hover:bg-enkaji-gold/90 transition-colors"
                >
                  Join as Buyer
                </a>
                <a
                  href="/sell"
                  className="border border-enkaji-gold/50 text-enkaji-gold px-6 py-3 rounded-lg font-semibold hover:bg-enkaji-gold/10 transition-colors"
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
