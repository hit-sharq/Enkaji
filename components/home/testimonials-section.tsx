import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import Image from "next/image"

const testimonials = [
  {
    name: "Grace Wanjiku",
    role: "Procurement Manager",
    company: "Nairobi Electronics Ltd",
    location: "Nairobi",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "This platform has revolutionized how we source electronics in Kenya. We've reduced costs by 25% while improving supplier reliability. The verification process gives us complete confidence.",
  },
  {
    name: "David Kiprop",
    role: "Owner",
    company: "Eldoret Hardware Supplies",
    location: "Eldoret",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "As a supplier from Eldoret, this platform has opened up markets across Kenya for us. We now serve customers from Mombasa to Kisumu. Our sales have tripled in just 8 months.",
  },
  {
    name: "Amina Hassan",
    role: "Fashion Retailer",
    company: "Coastal Fashion Hub",
    location: "Mombasa",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "Finding quality fashion suppliers was always a challenge. Now I can source from verified suppliers across Kenya with confidence. The logistics support is exceptional.",
  },
  {
    name: "Peter Mwangi",
    role: "Operations Director",
    company: "Central Kenya Distributors",
    location: "Nyeri",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "The trade assurance and quality control features have eliminated our biggest concerns about working with new suppliers. We've expanded our supplier network by 300%.",
  },
  {
    name: "Sarah Achieng",
    role: "Founder",
    company: "Kisumu Agro Supplies",
    location: "Kisumu",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "This platform connected us with agricultural suppliers we never knew existed. Our farmers now have access to better inputs at competitive prices. Game-changing for our community.",
  },
  {
    name: "Mohamed Ali",
    role: "General Manager",
    company: "Northern Kenya Trading Co.",
    location: "Garissa",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    content:
      "Being in Northern Kenya, we always struggled with supplier access. This platform has leveled the playing field. We now compete effectively with businesses in major cities.",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Businesses Across Kenya</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our customers from all 47 counties say about their experience on our platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 h-full">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <Quote className="w-8 h-8 text-blue-600 mb-2" />
                </div>

                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed flex-grow">"{testimonial.content}"</p>

                <div className="flex items-center mt-auto">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                    <div className="text-xs text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Kenya's Growing B2B Community</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Over 100,000 businesses across all 47 counties trust our platform for their sourcing and selling needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 font-semibold">
                Start Your Success Story
              </Button>
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 font-semibold bg-transparent"
              >
                View More Reviews
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
