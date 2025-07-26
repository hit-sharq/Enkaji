import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { RFQForm } from "@/components/rfq/rfq-form"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Clock, Users, Shield } from "lucide-react"

export default function RFQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Request for Quotation (RFQ)</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Can't find what you're looking for? Submit an RFQ and let Kenyan artisans compete to fulfill your
            requirements with the best prices and quality.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Multiple Quotes</h3>
              <p className="text-sm text-gray-600">Get competitive quotes from multiple artisans</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Quick Response</h3>
              <p className="text-sm text-gray-600">Receive quotes within 24-48 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Custom Solutions</h3>
              <p className="text-sm text-gray-600">Get exactly what you need, made to order</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Artisans</h3>
              <p className="text-sm text-gray-600">All quotes from verified, trusted artisans</p>
            </CardContent>
          </Card>
        </div>

        {/* RFQ Form */}
        <RFQForm />

        {/* How it Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Submit Your RFQ</h3>
              <p className="text-gray-600">
                Describe your requirements in detail including quantity, specifications, and timeline
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Receive Quotes</h3>
              <p className="text-gray-600">
                Qualified artisans will send you detailed quotes with pricing and delivery timelines
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Choose & Order</h3>
              <p className="text-gray-600">
                Compare quotes, negotiate if needed, and place your order with the best artisan
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
