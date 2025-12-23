import { TestimonialsGrid } from "@/components/testimonials/testimonials-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star, Users, Award } from "lucide-react"
import Link from "next/link"

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-enkaji-cream via-orange-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What Our Community Says
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover the success stories and experiences of businesses, artisans, and customers 
              who have found value in connecting through Enkaji Trade Kenya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/testimonials/submit">
                <Button size="lg" className="enkaji-button-primary">
                  Share Your Story
                </Button>
              </Link>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:testimonials@enkajitradeKenya.com">
                  Contact Us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center border-none shadow-lg">
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-enkaji-ochre mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                <p className="text-gray-600">Happy Customers</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-enkaji-ochre mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">4.8</div>
                <p className="text-gray-600">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-enkaji-ochre mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">50+</div>
                <p className="text-gray-600">Verified Reviews</p>
              </CardContent>
            </Card>
            <Card className="text-center border-none shadow-lg">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-enkaji-ochre mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">15+</div>
                <p className="text-gray-600">Industry Awards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Customer Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Read authentic testimonials from businesses, artisans, and customers who have 
              experienced the benefits of trading through Enkaji Trade Kenya.
            </p>
          </div>
          
          {/* Testimonials Grid - Client component will fetch and display testimonials */}
          <TestimonialsGrid />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-enkaji-red to-enkaji-brown">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Share Your Success Story?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join our growing community of satisfied customers and help others benefits of trading discover 
            the through Enkaji Trade Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/testimonials/submit">
              <Button size="lg" variant="secondary" className="bg-white text-enkaji-red hover:bg-gray-100">
                Submit Your Testimonial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10" asChild>
              <a href="/contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">How We Collect Testimonials</h3>
                  <p className="text-gray-600 mb-4">
                    We gather authentic feedback from verified customers who have successfully 
                    completed transactions through our platform. All testimonials are reviewed 
                    to ensure they meet our quality standards.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Verified customer purchases</li>
                    <li>• Real transaction confirmations</li>
                    <li>• Moderated content review</li>
                    <li>• Regular authenticity checks</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Your Experience</h3>
                  <p className="text-gray-600 mb-4">
                    Had a great experience with Enkaji Trade Kenya? We'd love to hear from you! 
                    Share your story and help other businesses discover our platform.
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Easy submission process</li>
                    <li>• Quick review and approval</li>
                    <li>• Featured on our platform</li>
                    <li>• Recognition for contributors</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
