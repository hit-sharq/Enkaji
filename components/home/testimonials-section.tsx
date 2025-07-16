import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CEO, TechStart Solutions",
    company: "Electronics Retailer",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "This platform has revolutionized how we source products globally. The supplier verification process gives us confidence in every transaction.",
  },
  {
    name: "Ahmed Hassan",
    role: "Procurement Manager",
    company: "Global Manufacturing Corp",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "We've reduced our sourcing costs by 30% while improving quality. The platform's logistics support is exceptional.",
  },
  {
    name: "Maria Rodriguez",
    role: "Founder",
    company: "Fashion Forward Boutique",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "As a small business owner, this platform has given me access to suppliers I never could have reached before. Game-changing!",
  },
  {
    name: "David Kim",
    role: "Supply Chain Director",
    company: "Home Goods International",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "The trade assurance and quality control features have eliminated our biggest concerns about international sourcing.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Businesses Worldwide</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers say about their experience trading on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-blue-600 mb-4" />
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>

                <div className="flex items-center">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
