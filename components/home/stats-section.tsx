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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Building Kenya's Premier B2B Marketplace
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're just getting started, but our vision is big. Join us as we build something amazing for Kenyan
            businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="font-semibold text-gray-700 mb-2">{stat.label}</p>
                <p className="text-sm text-gray-600">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white max-w-3xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Be Part of Our Growth Story</h3>
              <p className="text-orange-100 mb-6">
                Join Enkaji Trade Kenya today and help us build Kenya's most trusted B2B marketplace. Whether you're
                buying or selling, your success is our success.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/sign-up"
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Join as Buyer
                </a>
                <a
                  href="/sell"
                  className="bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors border border-orange-400"
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
