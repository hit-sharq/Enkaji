import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, ShoppingCart, BarChart3, Shield, Truck, CheckCircle } from "lucide-react"

export default function BusinessSolutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-enkaji-ink text-enkaji-ivory py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="enkaji-eyebrow mb-4">For Business</p>
            <h1 className="font-display font-semibold text-5xl mb-6">Business Solutions for Every Need</h1>
            <p className="text-lg mb-8 max-w-3xl mx-auto text-enkaji-ivory/80">
              Comprehensive B2B solutions to help your business grow, from procurement to logistics and everything in
              between.
            </p>
            <Button size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
              Get Started Today
            </Button>
          </div>
        </section>

        {/* Solutions Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Capabilities</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Our Business Solutions</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Tailored solutions for businesses of all sizes, from startups to large enterprises
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <Building2 className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Enterprise Procurement</CardTitle>
                  <CardDescription>Streamlined procurement solutions for large organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Bulk ordering with volume discounts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Dedicated account management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Custom pricing agreements
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Priority seller matching
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Learn More</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <Users className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Seller Network</CardTitle>
                  <CardDescription>Access to Kenya's largest verified seller network</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      10,000+ verified sellers
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Quality assurance programs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Seller performance tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Risk assessment tools
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Explore Network</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <ShoppingCart className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Digital Marketplace</CardTitle>
                  <CardDescription>Complete e-commerce solution for B2B transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Custom storefronts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Inventory management
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Order processing automation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Multi-channel integration
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Start Selling</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Analytics & Insights</CardTitle>
                  <CardDescription>Data-driven insights to optimize your business operations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Real-time dashboards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Market trend analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Performance metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Custom reporting
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">View Demo</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <Shield className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Trade Assurance</CardTitle>
                  <CardDescription>Comprehensive protection for all your business transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Payment protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Quality guarantees
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Dispute resolution
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Insurance coverage
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Get Protected</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <Truck className="w-12 h-12 text-enkaji-gold mb-4" />
                  <CardTitle>Logistics Solutions</CardTitle>
                  <CardDescription>End-to-end logistics and supply chain management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Nationwide delivery network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Warehousing services
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Real-time tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Customs clearance
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Ship Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Pricing</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Choose Your Plan</h2>
              <p className="text-muted-foreground">Flexible pricing to match your business needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="relative border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle>Starter</CardTitle>
                  <div className="text-3xl font-bold text-enkaji-gold">Free</div>
                  <CardDescription>Perfect for small businesses getting started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Up to 10 orders per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Basic supplier access
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Email support
                    </li>
                  </ul>
                  <Button className="w-full bg-transparent" variant="outline">
                    Get Started
                  </Button>
                </CardContent>
              </Card>

              <Card className="relative border-enkaji-gold border-2">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-enkaji-gold text-enkaji-ink">Most Popular</Badge>
                </div>
                <CardHeader className="text-center">
                  <CardTitle>Professional</CardTitle>
                  <div className="text-3xl font-bold text-enkaji-gold">
                    KSh 15,000<span className="text-sm text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>For growing businesses with regular orders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Unlimited orders
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Premium supplier network
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Priority support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Analytics dashboard
                    </li>
                  </ul>
                  <Button className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Choose Plan</Button>
                </CardContent>
              </Card>

              <Card className="relative border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <CardTitle>Enterprise</CardTitle>
                  <div className="text-3xl font-bold text-enkaji-gold">Custom</div>
                  <CardDescription>Tailored solutions for large organizations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Custom integrations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Dedicated account manager
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      24/7 phone support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      SLA guarantees
                    </li>
                  </ul>
                  <Button className="w-full bg-transparent" variant="outline">
                    Contact Sales
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display font-semibold text-3xl mb-4">Ready to Transform Your Business?</h2>
            <p className="text-xl text-enkaji-ivory/70 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using our platform to streamline their operations and grow their
              revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
