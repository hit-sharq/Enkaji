import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Package, Users, Clock, CheckCircle, TrendingUp } from "lucide-react"

export default function BulkOrdersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bulk Orders Made Simple</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get competitive prices for large quantity orders. Connect directly with manufacturers and wholesalers across
            Kenya.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Better Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Get wholesale prices and volume discounts for bulk purchases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Direct Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Connect directly with verified manufacturers and suppliers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <CardTitle>Fast Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Get quotes within 24 hours from multiple suppliers</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Bulk Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Request Bulk Quote
              </CardTitle>
              <CardDescription>Fill out the form below to get quotes from multiple suppliers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Person</Label>
                  <Input id="contact" placeholder="Your name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+254..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Product Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="textiles">Textiles & Fabrics</SelectItem>
                    <SelectItem value="agriculture">Agriculture</SelectItem>
                    <SelectItem value="construction">Construction Materials</SelectItem>
                    <SelectItem value="automotive">Automotive Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product Details</Label>
                <Textarea
                  id="product"
                  placeholder="Describe the products you need, specifications, quality requirements, etc."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity Needed</Label>
                  <Input id="quantity" placeholder="e.g., 1000 units" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range (KSh)</Label>
                  <Input id="budget" placeholder="e.g., 100,000 - 500,000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeline">Required Timeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you need this?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Within 1 week</SelectItem>
                    <SelectItem value="normal">Within 2-4 weeks</SelectItem>
                    <SelectItem value="flexible">1-2 months</SelectItem>
                    <SelectItem value="planning">3+ months (planning stage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional">Additional Requirements</Label>
                <Textarea
                  id="additional"
                  placeholder="Delivery location, payment terms, certifications needed, etc."
                  rows={3}
                />
              </div>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Submit Bulk Order Request</Button>
            </CardContent>
          </Card>

          {/* How It Works */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How Bulk Orders Work</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Submit Your Request</h4>
                    <p className="text-gray-600 text-sm">Fill out the bulk order form with your requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Get Multiple Quotes</h4>
                    <p className="text-gray-600 text-sm">Receive quotes from verified suppliers within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Compare & Choose</h4>
                    <p className="text-gray-600 text-sm">Compare prices, terms, and supplier profiles</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Secure Transaction</h4>
                    <p className="text-gray-600 text-sm">Complete your order with trade assurance protection</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Bulk Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Electronics</Badge>
                  <Badge variant="secondary">Textiles</Badge>
                  <Badge variant="secondary">Construction Materials</Badge>
                  <Badge variant="secondary">Agricultural Products</Badge>
                  <Badge variant="secondary">Automotive Parts</Badge>
                  <Badge variant="secondary">Home Appliances</Badge>
                  <Badge variant="secondary">Office Supplies</Badge>
                  <Badge variant="secondary">Food & Beverages</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Why Choose Our Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Verified suppliers only</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Trade assurance protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Quality inspection services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Secure payment options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Logistics support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
