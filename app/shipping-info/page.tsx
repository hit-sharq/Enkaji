import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Package, Shield, CreditCard, AlertCircle, CheckCircle, Info } from "lucide-react"

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Information</h1>
            <p className="text-xl text-gray-600">Everything you need to know about shipping with Enkaji Trade Kenya</p>
          </div>

          <Tabs defaultValue="rates" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="rates">Shipping Rates</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Times</TabsTrigger>
              <TabsTrigger value="coverage">Coverage Areas</TabsTrigger>
              <TabsTrigger value="packaging">Packaging</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="rates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Shipping Rates
                  </CardTitle>
                  <CardDescription>
                    Our competitive shipping rates based on weight, distance, and delivery speed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Local Delivery (Within Kenya)</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Standard Delivery</CardTitle>
                            <Badge variant="secondary">3-5 Business Days</Badge>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Up to 1kg:</span>
                                <span className="font-semibold">KSh 300</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1-5kg:</span>
                                <span className="font-semibold">KSh 500</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5-10kg:</span>
                                <span className="font-semibold">KSh 800</span>
                              </div>
                              <div className="flex justify-between">
                                <span>10-20kg:</span>
                                <span className="font-semibold">KSh 1,200</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Express Delivery</CardTitle>
                            <Badge variant="default">1-2 Business Days</Badge>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Up to 1kg:</span>
                                <span className="font-semibold">KSh 500</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1-5kg:</span>
                                <span className="font-semibold">KSh 800</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5-10kg:</span>
                                <span className="font-semibold">KSh 1,200</span>
                              </div>
                              <div className="flex justify-between">
                                <span>10-20kg:</span>
                                <span className="font-semibold">KSh 1,800</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Same Day</CardTitle>
                            <Badge className="bg-orange-500">Within 6 Hours</Badge>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Up to 1kg:</span>
                                <span className="font-semibold">KSh 800</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1-5kg:</span>
                                <span className="font-semibold">KSh 1,200</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5-10kg:</span>
                                <span className="font-semibold">KSh 1,800</span>
                              </div>
                              <div className="flex justify-between">
                                <span>10-20kg:</span>
                                <span className="font-semibold">KSh 2,500</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">International Shipping</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">East Africa</CardTitle>
                            <CardDescription>Uganda, Tanzania, Rwanda, etc.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Up to 1kg:</span>
                                <span className="font-semibold">KSh 1,500</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1-5kg:</span>
                                <span className="font-semibold">KSh 3,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5-10kg:</span>
                                <span className="font-semibold">KSh 5,500</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Worldwide</CardTitle>
                            <CardDescription>Europe, Asia, Americas, etc.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Up to 1kg:</span>
                                <span className="font-semibold">KSh 3,500</span>
                              </div>
                              <div className="flex justify-between">
                                <span>1-5kg:</span>
                                <span className="font-semibold">KSh 8,000</span>
                              </div>
                              <div className="flex justify-between">
                                <span>5-10kg:</span>
                                <span className="font-semibold">KSh 15,000</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Additional Charges</h4>
                          <ul className="text-sm text-blue-800 mt-2 space-y-1">
                            <li>• Remote area delivery: Additional KSh 200-500</li>
                            <li>• Fuel surcharge: 5-10% of shipping cost</li>
                            <li>• Insurance: 1-3% of declared value (optional)</li>
                            <li>• Customs duties and taxes (international shipments)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Delivery Times
                  </CardTitle>
                  <CardDescription>
                    Expected delivery times for different shipping options and destinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Domestic Delivery (Kenya)</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Same Day Delivery</h4>
                            <p className="text-sm text-gray-600">Available in Nairobi, Mombasa, Kisumu</p>
                          </div>
                          <Badge className="bg-green-500">2-6 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Express Delivery</h4>
                            <p className="text-sm text-gray-600">Major cities and towns</p>
                          </div>
                          <Badge variant="default">1-2 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Standard Delivery</h4>
                            <p className="text-sm text-gray-600">All locations nationwide</p>
                          </div>
                          <Badge variant="secondary">3-5 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Remote Areas</h4>
                            <p className="text-sm text-gray-600">Hard-to-reach locations</p>
                          </div>
                          <Badge variant="outline">5-7 business days</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">International Delivery</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">East Africa</h4>
                            <p className="text-sm text-gray-600">Uganda, Tanzania, Rwanda, Burundi</p>
                          </div>
                          <Badge variant="default">3-7 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Africa</h4>
                            <p className="text-sm text-gray-600">Nigeria, South Africa, Ghana, etc.</p>
                          </div>
                          <Badge variant="secondary">5-10 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Europe & Asia</h4>
                            <p className="text-sm text-gray-600">UK, Germany, China, India, etc.</p>
                          </div>
                          <Badge variant="secondary">7-14 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Americas & Oceania</h4>
                            <p className="text-sm text-gray-600">USA, Canada, Australia, etc.</p>
                          </div>
                          <Badge variant="outline">10-21 business days</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900">Delivery Time Notes</h4>
                          <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                            <li>
                              • Delivery times are estimates and may vary due to weather, customs, or other factors
                            </li>
                            <li>• Business days exclude weekends and public holidays</li>
                            <li>• Remote areas may require additional 1-3 days</li>
                            <li>• International deliveries may be delayed by customs clearance</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coverage" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Coverage Areas
                  </CardTitle>
                  <CardDescription>Areas we deliver to and service availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Kenya Coverage</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-3">✓ Full Service Areas</h4>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Major Cities:</strong> Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Thika, Malindi
                            </p>
                            <p>
                              <strong>Counties:</strong> All 47 counties with regular delivery routes
                            </p>
                            <p>
                              <strong>Services Available:</strong> Same-day, Express, Standard delivery
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-orange-600 mb-3">⚠ Limited Service Areas</h4>
                          <div className="space-y-2 text-sm">
                            <p>
                              <strong>Remote Areas:</strong> Some rural and hard-to-reach locations
                            </p>
                            <p>
                              <strong>Island Destinations:</strong> Lamu, Rusinga, Mfangano islands
                            </p>
                            <p>
                              <strong>Services Available:</strong> Standard delivery only, additional charges apply
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">International Coverage</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base text-green-600">East Africa</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Uganda</li>
                              <li>• Tanzania</li>
                              <li>• Rwanda</li>
                              <li>• Burundi</li>
                              <li>• South Sudan</li>
                              <li>• Ethiopia</li>
                              <li>• Somalia</li>
                              <li>• DRC</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base text-blue-600">Africa</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Nigeria</li>
                              <li>• South Africa</li>
                              <li>• Ghana</li>
                              <li>• Egypt</li>
                              <li>• Morocco</li>
                              <li>• Algeria</li>
                              <li>• Tunisia</li>
                              <li>• And more...</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base text-purple-600">Worldwide</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Europe (All EU countries)</li>
                              <li>• Asia (China, India, Japan, etc.)</li>
                              <li>• Americas (USA, Canada, Brazil)</li>
                              <li>• Middle East (UAE, Saudi, etc.)</li>
                              <li>• Oceania (Australia, NZ)</li>
                              <li>• 200+ countries total</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packaging" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Packaging Guidelines
                  </CardTitle>
                  <CardDescription>How to properly package your items for safe delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Packaging Requirements</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-3">✓ Recommended Practices</h4>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Use sturdy boxes or padded envelopes
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Wrap fragile items in bubble wrap
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Fill empty spaces with packing material
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Seal all edges with strong tape
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Label clearly with permanent markers
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 mb-3">✗ Avoid These Mistakes</h4>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              Using damaged or weak boxes
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              Insufficient padding for fragile items
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              Overpacking boxes beyond weight limits
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              Using string or rope instead of tape
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                              Unclear or missing address labels
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Special Item Guidelines</h3>
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Electronics</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Use original packaging when possible</li>
                              <li>• Anti-static bubble wrap for sensitive components</li>
                              <li>• Remove batteries if possible</li>
                              <li>• Include "FRAGILE" and "THIS WAY UP" labels</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Liquids & Chemicals</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Use leak-proof containers</li>
                              <li>• Double-bag in plastic bags</li>
                              <li>• Declare contents accurately</li>
                              <li>• Follow hazardous materials regulations</li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Documents</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-1">
                              <li>• Use waterproof envelopes or bags</li>
                              <li>• Include backup copies when possible</li>
                              <li>• Use registered mail for important documents</li>
                              <li>• Consider digital alternatives</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Package Tracking
                  </CardTitle>
                  <CardDescription>How to track your shipments and what each status means</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tracking Your Package</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">How to Track</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Use your tracking number on our website</li>
                            <li>• Receive SMS updates automatically</li>
                            <li>• Get email notifications at key milestones</li>
                            <li>• Use our mobile app for real-time updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Tracking Status Meanings</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Order Received</p>
                            <p className="text-sm text-gray-600">We've received your shipping request</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Package Collected</p>
                            <p className="text-sm text-gray-600">Package picked up from sender</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">In Transit</p>
                            <p className="text-sm text-gray-600">Package is on its way to destination</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Out for Delivery</p>
                            <p className="text-sm text-gray-600">Package is with delivery agent</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Delivered</p>
                            <p className="text-sm text-gray-600">Package successfully delivered</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div>
                            <p className="font-semibold">Exception</p>
                            <p className="text-sm text-gray-600">Delivery issue - contact support</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Delivery Confirmation</h3>
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <span className="font-semibold">Proof of Delivery</span>
                              </div>
                              <ul className="text-sm text-gray-600 space-y-1 ml-7">
                                <li>• Digital signature capture</li>
                                <li>• Photo confirmation of delivery</li>
                                <li>• GPS location verification</li>
                                <li>• Time and date stamp</li>
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
