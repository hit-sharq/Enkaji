"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Truck, Users, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Trade Assurance",
    description:
      "Secure transactions with our comprehensive trade protection program. Your payments are protected until you confirm receipt.",
    color: "text-enkaji-red bg-enkaji-red/10",
  },
  {
    icon: Users,
    title: "Verified Suppliers",
    description:
      "All suppliers undergo rigorous verification. Connect with trusted businesses across Kenya with confidence.",
    color: "text-enkaji-green bg-enkaji-green/10",
  },
  {
    icon: Truck,
    title: "Nationwide Logistics",
    description:
      "Reliable delivery network covering all 47 counties. From Nairobi to Turkana, we ensure your products reach you.",
    color: "text-enkaji-ochre bg-enkaji-ochre/10",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description:
      "Every product meets our quality standards. Dispute resolution and quality assurance for peace of mind.",
    color: "text-enkaji-gold bg-enkaji-gold/10",
  },
]

export function MissionSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-enkaji-cream/30 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-enkaji-brown to-enkaji-green bg-clip-text text-transparent">
              Why Choose Enkaji
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're transforming B2B commerce in Kenya by connecting businesses with reliable suppliers, ensuring secure
            transactions, and facilitating growth across all sectors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-enkaji-red to-enkaji-ochre rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Empowering Kenyan Businesses</h3>
          <p className="text-xl mb-6 opacity-90 max-w-2xl mx-auto">
            From small enterprises to large corporations, we provide the platform and tools needed to source products,
            build partnerships, and scale operations across Kenya.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="opacity-90">Customer Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">100%</div>
              <div className="opacity-90">Secure Payments</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">47</div>
              <div className="opacity-90">Counties Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
