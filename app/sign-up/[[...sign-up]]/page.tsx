import { Button } from "@/components/ui/button"
import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Store, ArrowLeft, ShoppingCart, Package } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">Enkaji Trade Kenya</span>
              <span className="text-sm text-gray-500 -mt-1">Kenya's B2B Marketplace</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Enkaji Trade Kenya</h1>
          <p className="text-gray-600">Connect with businesses across Kenya and grow your trade</p>
        </div>

        {/* Sign Up Component */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white",
                  footerActionLink: "text-orange-600 hover:text-orange-700",
                  identityPreviewEditButton: "text-orange-600 hover:text-orange-700",
                  formFieldInput: "border-gray-300 focus:border-orange-500 focus:ring-orange-500",
                  formFieldLabel: "text-gray-700 font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                },
              }}
              redirectUrl="/dashboard"
              signInUrl="/sign-in"
            />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8 space-y-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <ShoppingCart className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">As a Buyer:</h3>
                  <ul className="space-y-1 text-sm text-orange-700">
                    <li>• Access thousands of Kenyan products</li>
                    <li>• Connect directly with sellers</li>
                    <li>• Secure payment & delivery</li>
                    <li>• Bulk ordering discounts</li>
                    <li>• Request custom quotations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-2">As a Seller:</h3>
                  <ul className="space-y-1 text-sm text-red-700">
                    <li>• Reach customers nationwide</li>
                    <li>• List unlimited products</li>
                    <li>• Manage orders efficiently</li>
                    <li>• Accept bulk orders & RFQs</li>
                    <li>• Grow your business online</li>
                  </ul>
                  <Link href="/sell" className="inline-block mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                    >
                      Start Selling Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
