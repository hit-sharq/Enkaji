import { TestimonialsGrid } from "@/components/testimonials/testimonials-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Star, Users, Award } from "lucide-react"
import Link from "next/link"

export default function TestimonialsPage() {
  return (
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-enkaji-cream py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <p className="enkaji-eyebrow mb-3">Community</p>
            <h1 className="font-playfair font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              What Our Community Says
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
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
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center border border-border bg-card rounded-xl shadow-sm">
              <CardContent className="p-6">
                <MessageSquare className="w-8 h-8 text-enkaji-gold mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">500+</div>
                <p className="text-muted-foreground">Happy Customers</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-border bg-card rounded-xl shadow-sm">
              <CardContent className="p-6">
                <Star className="w-8 h-8 text-enkaji-gold mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">4.8</div>
                <p className="text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-border bg-card rounded-xl shadow-sm">
              <CardContent className="p-6">
                <Users className="w-8 h-8 text-enkaji-gold mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">50+</div>
                <p className="text-muted-foreground">Verified Reviews</p>
              </CardContent>
            </Card>
            <Card className="text-center border border-border bg-card rounded-xl shadow-sm">
              <CardContent className="p-6">
                <Award className="w-8 h-8 text-enkaji-gold mx-auto mb-4" />
                <div className="text-3xl font-bold text-foreground mb-2">15+</div>
                <p className="text-muted-foreground">Industry Awards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="enkaji-eyebrow mb-3">Stories</p>
            <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Customer Success Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Read authentic testimonials from businesses, artisans, and customers who have 
              experienced the benefits of trading through Enkaji Trade Kenya.
            </p>
          </div>
           
          {/* Testimonials Grid - Client component will fetch and display testimonials */}
          <TestimonialsGrid />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display font-semibold text-3xl text-enkaji-ivory mb-4">
            Ready to Share Your Success Story?
          </h2>
          <p className="text-xl text-enkaji-ivory/90 mb-8 max-w-2xl mx-auto">
            Join our growing community of satisfied customers and help others benefits of trading discover 
            the through Enkaji Trade Kenya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/testimonials/submit">
              <Button size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                Submit Your Testimonial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10" asChild>
              <a href="/contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border border-border bg-card rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">How We Collect Testimonials</h3>
                  <p className="text-muted-foreground mb-4">
                    We gather authentic feedback from verified customers who have successfully 
                    completed transactions through our platform. All testimonials are reviewed 
                    to ensure they meet our quality standards.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Verified customer purchases</li>
                    <li>• Real transaction confirmations</li>
                    <li>• Moderated content review</li>
                    <li>• Regular authenticity checks</li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border border-border bg-card rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-xl text-foreground mb-4">Submit Your Experience</h3>
                  <p className="text-muted-foreground mb-4">
                    Had a great experience with Enkaji Trade Kenya? We'd love to hear from you! 
                    Share your story and help other businesses discover our platform.
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2">
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
