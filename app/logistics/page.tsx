import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Package, MapPin, BarChart3, Plane, Ship, CheckCircle, Calculator } from "lucide-react"

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 to-teal-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <Truck className="w-20 h-20 mx-auto mb-6 text-green-200" />
            <h1 className="text-5xl font-bold mb-6">Logistics Solutions</h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Comprehensive logistics and supply chain solutions to get your products where they need to be, when they
              need to be there.
            </p>
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              Get Shipping Quote
            </Button>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Logistics Services</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From local delivery to international shipping, we've got your logistics needs covered
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Truck className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Local Delivery</CardTitle>
                  <CardDescription>Fast and reliable delivery within Kenya</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Same-day delivery in major cities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Next-day delivery nationwide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Real-time tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof of delivery
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">Book Delivery</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Package className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Warehousing</CardTitle>
                  <CardDescription>Secure storage and inventory management</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Climate-controlled facilities
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      24/7 security monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Inventory management system
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Pick and pack services
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">View Facilities</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Plane className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Air Freight</CardTitle>
                  <CardDescription>Fast international shipping solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Express delivery worldwide
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Customs clearance support
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Temperature-controlled options
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Door-to-door service
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">Get Air Quote</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Ship className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Sea Freight</CardTitle>
                  <CardDescription>Cost-effective ocean shipping</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Full container loads (FCL)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Less than container loads (LCL)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Port-to-port service
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cargo insurance
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">Get Sea Quote</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <MapPin className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Last Mile Delivery</CardTitle>
                  <CardDescription>Final delivery to your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Flexible delivery windows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      SMS/email notifications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cash on delivery (COD)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Return handling
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">Setup Delivery</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <CardTitle>Supply Chain Analytics</CardTitle>
                  <CardDescription>Data-driven logistics optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Performance dashboards
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cost optimization reports
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Delivery performance metrics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Predictive analytics
                    </li>
                  </ul>
                  <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">View Analytics</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Shipping Calculator */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipping Calculator</h2>
                <p className="text-gray-600">Get instant quotes for your shipping needs</p>
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
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold mb-4">Shipping Options</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <p className="font-medium">Standard Delivery</p>
                              <p className="text-sm text-gray-500">3-5 business days</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 850</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <p className="font-medium">Express Delivery</p>
                              <p className="text-sm text-gray-500">1-2 business days</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 1,250</p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-white rounded border">
                            <div>
                              <p className="font-medium">Same Day</p>
                              <p className="text-sm text-gray-500">Within 6 hours</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">KSh 2,100</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700">Book Shipment</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Coverage Map */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Coverage Network</h2>
              <p className="text-gray-600">Serving businesses across Kenya and beyond</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>Local Coverage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600">47</div>
                    <p className="text-gray-600">Counties Covered</p>
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
                    <div className="text-3xl font-bold text-green-600">15</div>
                    <p className="text-gray-600">East African Countries</p>
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
                    <div className="text-3xl font-bold text-green-600">200+</div>
                    <p className="text-gray-600">Countries Worldwide</p>
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
        <section className="py-16 bg-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Streamline Your Logistics?</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Let us handle your logistics so you can focus on growing your business
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-600 bg-transparent"
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
