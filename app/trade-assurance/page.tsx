import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle, CreditCard, FileText, Users, Clock, AlertTriangle, Star, TrendingUp } from "lucide-react"

export default function TradeAssurancePage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-enkaji-ink text-enkaji-ivory py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="enkaji-eyebrow mb-4">Protection</p>
            <Shield className="w-20 h-20 mx-auto mb-6 text-enkaji-orange/70" />
            <h1 className="font-display font-semibold text-5xl mb-6">Trade Assurance Protection</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-enkaji-ivory/80">
              Complete protection for your business transactions. Trade with confidence knowing your orders, payments,
              and quality are guaranteed.
            </p>
            <Button size="lg" className="bg-enkaji-orange hover:bg-enkaji-orange/90 text-enkaji-ink font-semibold">
              Get Protected Now
            </Button>
          </div>
        </section>

        {/* Protection Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Coverage</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Complete Protection Coverage</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our comprehensive trade assurance program protects every aspect of your business transactions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <CreditCard className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Payment Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      100% payment security
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Escrow service available
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Refund guarantee
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Fraud prevention
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <FileText className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Pre-shipment inspection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Quality certificates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Sample verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Compliance checks
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <Clock className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Delivery Guarantee</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      On-time delivery promise
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Shipment tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Damage protection
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Insurance coverage
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Seller Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Business license verification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Financial background checks
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Production capability audit
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Reference verification
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <AlertTriangle className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Dispute Resolution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      24/7 mediation service
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Expert arbitration
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Fast resolution process
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Legal support
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="hover:shadow-card-hover transition-shadow border border-border bg-card rounded-2xl shadow-card">
                <CardHeader className="text-center">
                  <TrendingUp className="w-12 h-12 text-enkaji-orange mx-auto mb-4" />
                  <CardTitle>Performance Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Seller performance tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Quality score monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Delivery performance metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-orange" />
                      Customer feedback system
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Process</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">How Trade Assurance Works</h2>
              <p className="text-muted-foreground">Simple steps to secure your business transactions</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-enkaji-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-enkaji-orange">1</span>
                  </div>
                  <h3 className="font-semibold mb-2">Choose Protected Sellers</h3>
                  <p className="text-sm text-muted-foreground">
                    Select from our verified sellers with Trade Assurance coverage
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-enkaji-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-enkaji-orange">2</span>
                  </div>
                  <h3 className="font-semibold mb-2">Place Your Order</h3>
                  <p className="text-sm text-muted-foreground">Complete your order with automatic Trade Assurance protection</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-enkaji-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-enkaji-orange">3</span>
                  </div>
                  <h3 className="font-semibold mb-2">Track & Monitor</h3>
                  <p className="text-sm text-muted-foreground">
                    Monitor your order progress with real-time updates and quality checks
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-enkaji-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-enkaji-orange">4</span>
                  </div>
                  <h3 className="font-semibold mb-2">Receive & Confirm</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your order and confirm satisfaction or get full protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Results</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Trusted by Thousands</h2>
              <p className="text-muted-foreground">Our track record speaks for itself</p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-enkaji-orange mb-2">99.8%</div>
                <p className="text-muted-foreground">Order Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-enkaji-orange mb-2">KSh 2.5B+</div>
                <p className="text-muted-foreground">Protected Transactions</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-enkaji-orange mb-2">15,000+</div>
                <p className="text-muted-foreground">Protected Businesses</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-enkaji-orange mb-2">24hrs</div>
                <p className="text-muted-foreground">Average Resolution Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Reviews</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">What Our Customers Say</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      <Card className="border border-border bg-card rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-enkaji-orange fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Trade Assurance gave us the confidence to work with new sellers. The payment protection and
                    quality guarantees are exactly what we needed."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">Sarah Kimani</p>
                      <p className="text-sm text-muted-foreground">Procurement Manager, TechCorp Kenya</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

      <Card className="border border-border bg-card rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-enkaji-orange fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The dispute resolution service saved us when we had quality issues. The team was professional and
                    resolved everything quickly."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">James Mwangi</p>
                      <p className="text-sm text-muted-foreground">CEO, BuildRight Construction</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

      <Card className="border border-border bg-card rounded-2xl shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-enkaji-orange fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "As a small business, Trade Assurance levels the playing field. We can now compete for larger orders
                    with confidence."
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
                    <div>
                      <p className="font-semibold">Grace Wanjiku</p>
                      <p className="text-sm text-muted-foreground">Owner, Wanjiku Textiles</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display font-semibold text-3xl mb-4">Start Trading with Confidence</h2>
            <p className="text-xl text-enkaji-ivory/70 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already protected by our Trade Assurance program
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-enkaji-orange hover:bg-enkaji-orange/90 text-enkaji-ink font-semibold">
                Get Protected Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-enkaji-orange/50 text-enkaji-orange hover:bg-enkaji-orange/10 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
