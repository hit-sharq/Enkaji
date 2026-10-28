"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Truck, Users, Award } from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Trade Assurance",
    description:
      "Secure transactions with our comprehensive trade protection program. Your payments are protected until you confirm receipt.",
    color: "text-enkaji-orange bg-enkaji-orange/10",
  },
  {
    icon: Users,
    title: "Verified Sellers",
    description:
      "All sellers undergo rigorous verification. Connect with trusted businesses across Kenya with confidence.",
    color: "text-enkaji-orange bg-enkaji-orange/10",
  },
  {
    icon: Truck,
    title: "Nationwide Logistics",
    description:
      "Reliable delivery network covering all 47 counties. From Nairobi to Turkana, we ensure your products reach you.",
    color: "text-enkaji-orange bg-enkaji-orange/10",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description:
      "Every product meets our quality standards. Dispute resolution and quality assurance for peace of mind.",
    color: "text-enkaji-orange bg-enkaji-orange/10",
  },
]

export function MissionSection() {
  return (
    <section className="bg-gradient-to-b from-enkaji-cream/40 to-background py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 text-center md:mb-14">
          <p className="enkaji-eyebrow mb-3 md:mb-6">Our Promise</p>
          <h2 className="mb-3 font-display text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            <span className="enkaji-gradient-text">Why Choose Enkaji</span>
          </h2>
          <p className="mx-auto max-w-3xl px-2 text-sm leading-relaxed text-muted-foreground md:text-xl md:px-0">
            We&apos;re transforming B2B commerce in Kenya by connecting businesses with reliable sellers, ensuring secure
            transactions, and facilitating growth across all sectors.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6 md:mb-14">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="enkaji-card"
            >
              <CardContent className="p-6 text-center">
                <div
                  className={`mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full ${feature.color}`}
                >
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="rounded-2xl bg-enkaji-orange p-8 text-center text-white md:p-12">
          <h3 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Empowering Kenyan Businesses
          </h3>
          <p className="mx-auto mb-6 max-w-2xl text-xl text-white/80">
            From small enterprises to large corporations, we provide the platform and tools needed to source products,
            build partnerships, and scale operations across Kenya.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-2 font-display text-3xl font-bold">24/7</div>
              <div className="text-white/80">Customer Support</div>
            </div>
            <div>
              <div className="mb-2 font-display text-3xl font-bold">100%</div>
              <div className="text-white/80">Secure Payments</div>
            </div>
            <div>
              <div className="mb-2 font-display text-3xl font-bold">47</div>
              <div className="text-white/80">Counties Covered</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
