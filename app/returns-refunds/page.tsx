import { Header } from "@/components/layout/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, CreditCard, Clock, CheckCircle, AlertTriangle, Package, FileText, Shield } from "lucide-react"

export default function ReturnsRefundsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Returns & Refunds</h1>
            <p className="text-xl text-gray-600">Easy returns and hassle-free refunds for your peace of mind</p>
          </div>

          <Tabs defaultValue="policy" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="policy">Return Policy</TabsTrigger>
              <TabsTrigger value="process">Return Process</TabsTrigger>
              <TabsTrigger value="refunds">Refunds</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            <TabsContent value="policy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Return Policy Overview
                  </CardTitle>
                  <CardDescription>
                    Our comprehensive return policy designed to protect buyers and sellers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="text-center">
                          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                          <CardTitle className="text-base">30-Day Window</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 text-center">
                            Return items within 30 days of delivery for most products
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="text-center">
                          <Package className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <CardTitle className="text-base">Original Condition</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 text-center">
                            Items must be unused, undamaged, and in original packaging
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="text-center">
                          <Shield className="w-12 h-12 text-purple-500 mx-auto mb-2" />
                          <CardTitle className="text-base">Buyer Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 text-center">
                            Full protection for items not as described or defective
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Eligible Items for Return</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-green-600 mb-3">✓ Returnable Items</h4>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Electronics (within 30 days)
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Clothing and accessories
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Home and garden items
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Books and media
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Defective or damaged items
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                              Items not as described
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-red-600 mb-3">✗ Non-Returnable Items</h4>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Perishable goods (food, flowers)
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Personal hygiene items
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Custom or personalized items
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Digital downloads
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Items damaged by misuse
                            </li>
                            <li className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              Items without original packaging
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Return Reasons</h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-red-50 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-2">Seller Responsibility</h4>
                          <p className="text-sm text-red-800 mb-2">Seller pays return shipping for:</p>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• Item not as described</li>
                            <li>• Defective or damaged items</li>
                            <li>• Wrong item sent</li>
                            <li>• Missing parts or accessories</li>
                          </ul>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Buyer Responsibility</h4>
                          <p className="text-sm text-blue-800 mb-2">Buyer pays return shipping for:</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Changed mind</li>
                            <li>• Ordered wrong size/color</li>
                            <li>• No longer needed</li>
                            <li>• Found better price elsewhere</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="process" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    How to Return an Item
                  </CardTitle>
                  <CardDescription>Step-by-step guide to returning your purchase</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">1</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Initiate Return Request</h3>
                          <p className="text-gray-600 text-sm mb-2">
                            Log into your account and go to "My Orders" to start a return request
                          </p>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Start Return Request
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">2</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Select Return Reason</h3>
                          <p className="text-gray-600 text-sm">
                            Choose the reason for your return and provide any additional details
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">3</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Get Return Authorization</h3>
                          <p className="text-gray-600 text-sm">
                            Receive return authorization number and shipping instructions via email
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">4</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Package the Item</h3>
                          <p className="text-gray-600 text-sm">
                            Pack the item securely in original packaging with all accessories
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-semibold">5</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Ship the Return</h3>
                          <p className="text-gray-600 text-sm">
                            Use the provided return label or arrange pickup through our logistics partners
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-semibold">6</span>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Receive Confirmation</h3>
                          <p className="text-gray-600 text-sm">
                            Get confirmation once we receive and process your return
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900">Important Notes</h4>
                          <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                            <li>• Keep your return tracking number for reference</li>
                            <li>• Returns without authorization may be rejected</li>
                            <li>• Original shipping costs are non-refundable (unless seller error)</li>
                            <li>• Processing time starts when we receive the returned item</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="refunds" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Refund Information
                  </CardTitle>
                  <CardDescription>How and when you'll receive your refund</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Refund Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Return Processing</h4>
                            <p className="text-sm text-gray-600">After we receive your return</p>
                          </div>
                          <Badge variant="default">2-3 business days</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Refund Initiation</h4>
                            <p className="text-sm text-gray-600">Once return is approved</p>
                          </div>
                          <Badge variant="default">1 business day</Badge>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-semibold">Bank Processing</h4>
                            <p className="text-sm text-gray-600">Time for funds to appear in account</p>
                          </div>
                          <Badge variant="secondary">3-7 business days</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Refund Methods</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Original Payment Method</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Credit/Debit Cards
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                M-Pesa
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Bank Transfer
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                PayPal
                              </li>
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Store Credit</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm space-y-2">
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Instant processing
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                No expiration date
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Use for future purchases
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                Transferable to others
                              </li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Partial Refunds</h3>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 mb-3">
                          Partial refunds may be issued in the following situations:
                        </p>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Item returned with missing parts or accessories</li>
                          <li>• Item shows signs of use beyond normal inspection</li>
                          <li>• Item returned after 30-day window (case-by-case basis)</li>
                          <li>• Restocking fee for certain electronics (up to 15%)</li>
                        </ul>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700">
                        Check Refund Status
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Common questions about returns and refunds</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">How long do I have to return an item?</h3>
                      <p className="text-sm text-gray-600">
                        You have 30 days from the delivery date to initiate a return for most items. Some categories
                        like electronics may have different return windows.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Who pays for return shipping?</h3>
                      <p className="text-sm text-gray-600">
                        If the return is due to seller error (wrong item, defective, not as described), the seller
                        covers return shipping. For buyer remorse returns, the buyer is responsible for return shipping
                        costs.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Can I return items without original packaging?</h3>
                      <p className="text-sm text-gray-600">
                        Items must be returned in original packaging when possible. Items without original packaging may
                        be subject to partial refunds or rejection depending on the condition.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">How long does it take to get my refund?</h3>
                      <p className="text-sm text-gray-600">
                        Once we receive and process your return (2-3 business days), refunds are initiated within 1
                        business day. Bank processing takes an additional 3-7 business days depending on your payment
                        method.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Can I exchange an item instead of returning it?</h3>
                      <p className="text-sm text-gray-600">
                        Yes! You can request an exchange for a different size, color, or model during the return
                        process. Exchanges are subject to availability and may require additional payment for price
                        differences.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">What if my item arrives damaged?</h3>
                      <p className="text-sm text-gray-600">
                        Contact us immediately with photos of the damaged item and packaging. We'll arrange for a
                        replacement or full refund, and you won't need to return the damaged item in most cases.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Can I return custom or personalized items?</h3>
                      <p className="text-sm text-gray-600">
                        Custom and personalized items are generally non-returnable unless they arrive defective or
                        significantly different from what was ordered. Contact customer service for case-by-case
                        evaluation.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">What happens if I don't receive my refund?</h3>
                      <p className="text-sm text-gray-600">
                        If you haven't received your refund within the expected timeframe, first check with your bank.
                        If the issue persists, contact our customer service team with your return confirmation number.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Need More Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-600">
                      Can't find the answer you're looking for? Our customer service team is here to help.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="outline">Live Chat Support</Button>
                      <Button variant="outline">Email Support</Button>
                      <Button variant="outline">Call: +254 700 123 456</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
