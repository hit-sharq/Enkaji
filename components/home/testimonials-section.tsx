"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

// Note: These should be replaced with real testimonials from actual users
const testimonials = [
  {
    id: 1,
    name: "Coming Soon",
    business: "Real Customer Testimonials",
    content: "We're collecting genuine feedback from our users. Your testimonial could be featured here!",
    rating: 5,
  },
  {
    id: 2,
    name: "Share Your Experience",
    business: "Verified Buyers & Sellers",
    content: "Have you used Enkaji Trade Kenya? We'd love to hear about your experience and feature your story.",
    rating: 5,
  },
  {
    id: 3,
    name: "Join Our Community",
    business: "Growing Network",
    content: "Be among the first to experience Kenya's premier B2B marketplace and help us build something amazing.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're building Kenya's premier B2B marketplace. Join us and be part of the success stories we'll feature
            here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-orange-600 mb-2" />
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full mr-4 bg-gradient-to-br from-enkaji-gold to-enkaji-ochre flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.business}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action for Testimonials */}
        <div className="text-center mt-12">
          <Card className="bg-orange-50 border-orange-200 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-semibold text-orange-900 text-xl mb-4">
                Have a Great Experience with Enkaji Trade Kenya?
              </h3>
              <p className="text-orange-700 mb-6">
                We'd love to hear your story! Share your experience and help other businesses discover the benefits of
                our platform.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-orange-600">
                  <strong>Email us:</strong> testimonials@enkajitradeKenya.com
                </p>
                <p className="text-sm text-orange-600">
                  <strong>WhatsApp:</strong> +254 700 000 000
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
