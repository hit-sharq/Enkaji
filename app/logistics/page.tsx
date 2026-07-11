import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Package, MapPin, BarChart3, Plane, Ship, CheckCircle, Calculator } from "lucide-react"

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="bg-enkaji-ink text-enkaji-ivory py-20">
          <div className="container mx-auto px-4 text-center">
            <p className="enkaji-eyebrow mb-4">Logistics</p>
            <Truck className="w-20 h-20 mx-auto mb-6 text-enkaji-gold/70" />
            <h1 className="font-display font-semibold text-5xl mb-6">Logistics Solutions</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-enkaji-ivory/80">
              Comprehensive logistics and supply chain solutions to get your products where they need to be, when they
              need to be there.
            </p>
            <Button size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
              Get Shipping Quote
            </Button>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Services</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Our Logistics Services</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                From local delivery to international shipping, we've got your logistics needs covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <Truck className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Local Delivery</CardTitle>
                  <CardDescription>Fast and reliable delivery within Kenya</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Same-day delivery in major cities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Next-day delivery nationwide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Real-time tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Proof of delivery
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Book Delivery</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <Package className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Warehousing</CardTitle>
                  <CardDescription>Secure storage and inventory management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Climate-controlled facilities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      24/7 security monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Inventory management system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Pick and pack services
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">View Facilities</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <Plane className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Air Freight</CardTitle>
                  <CardDescription>Fast international shipping solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Express delivery worldwide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Customs clearance support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Temperature-controlled options
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Door-to-door service
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Get Air Quote</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <Ship className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Sea Freight</CardTitle>
                  <CardDescription>Cost-effective ocean shipping</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Full container loads (FCL)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Less than container loads (LCL)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Port-to-port service
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Cargo insurance
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Get Sea Quote</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <MapPin className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Last Mile Delivery</CardTitle>
                  <CardDescription>Final delivery to your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Flexible delivery windows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      SMS/email notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Cash on delivery (COD)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Return handling
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Setup Delivery</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow border border-border bg-card rounded-xl shadow-sm">
                <CardHeader className="text-center">
                  <BarChart3 className="w-12 h-12 text-enkaji-gold mx-auto mb-4" />
                  <CardTitle>Supply Chain Analytics</CardTitle>
                  <CardDescription>Data-driven logistics optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Performance dashboards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Cost optimization reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Delivery performance metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-enkaji-gold" />
                      Predictive analytics
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">View Analytics</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Shipping Calculator */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <p className="enkaji-eyebrow mb-3">Estimate</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Shipping Calculator</h2>
                <p className="text-muted-foreground">Get instant quotes for your shipping needs</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Calculate Shipping Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="from">From (Origin)</Label>
                        <Input id="from" placeholder="Enter pickup location" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="to">To (Destination)</Label>
                        <Input id="to" placeholder="Enter delivery location" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input id="weight" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dimensions">Dimensions (cm)</Label>
                          <Input id="dimensions" placeholder="L x W x H" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 bg-background rounded-lg">
                        <h3 className="font-semibold mb-4">Shipping Options</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-card rounded border">
                            <div>
                              <p className="font-medium">Standard Delivery</p>
                              <p className="text-sm text-muted-foreground">3-5 business days</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 850</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-card rounded border">
                            <div>
                              <p className="font-medium">Express Delivery</p>
                              <p className="text-sm text-muted-foreground">1-2 business days</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 1,250</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-card rounded border">
                            <div>
                              <p className="font-medium">Same Day</p>
                              <p className="text-sm text-muted-foreground">Within 6 hours</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 2,100</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">Book Shipment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Coverage Map */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="enkaji-eyebrow mb-3">Network</p>
              <h2 className="font-display font-semibold text-3xl text-foreground mb-4">Our Coverage Network</h2>
              <p className="text-muted-foreground">Serving businesses across Kenya and beyond</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Local Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-enkaji-gold">47</div>
                    <p className="text-muted-foreground">Counties Covered</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• All major cities and towns</li>
                    <li>• Rural area coverage</li>
                    <li>• Island destinations</li>
                    <li>• Remote locations</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Regional Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-enkaji-gold">15</div>
                    <p className="text-muted-foreground">East African Countries</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Uganda, Tanzania, Rwanda</li>
                    <li>• Ethiopia, South Sudan</li>
                    <li>• DRC, Burundi</li>
                    <li>• And more...</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Global Reach</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-enkaji-gold">200+</div>
                    <p className="text-muted-foreground">Countries Worldwide</p>
                  </div>
                  <ul className="text-sm space-y-1">
                    <li>• Europe, Asia, Americas</li>
                    <li>• Middle East, Australia</li>
                    <li>• Express air services</li>
                    <li>• Ocean freight options</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display font-semibold text-3xl mb-4">Ready to Streamline Your Logistics?</h2>
            <p className="text-xl text-enkaji-ivory/70 mb-8 max-w-2xl mx-auto">
              Let us handle your logistics so you can focus on growing your business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10 bg-transparent"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
