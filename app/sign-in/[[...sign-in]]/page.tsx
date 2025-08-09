import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Store, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-bold text-gray-900">Enkaji Trade Kenya</span>
              <span className="text-sm text-gray-500 -mt-1">Kenya's B2B Marketplace</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue trading</p>
        </div>

        {/* Sign In Component */}
        <Card className="shadow-xl border-0 mb-8">
          <CardContent className="p-6">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full bg-transparent",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50 transition-colors",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white transition-colors normal-case",
                  footerActionLink: "text-orange-600 hover:text-orange-700 transition-colors",
                  identityPreviewEditButton: "text-orange-600 hover:text-orange-700",
                  formFieldInput: "border-gray-300 focus:border-orange-500 focus:ring-orange-500 focus:ring-1",
                  formFieldLabel: "text-gray-700 font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                  alertText: "text-red-600",
                  formFieldErrorText: "text-red-600 text-sm",
                  footer: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                },
              }}
              fallbackRedirectUrl="/dashboard"
              signUpUrl="/sign-up"
              routing="path"
              path="/sign-in"
            />
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="space-y-4">
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-orange-900">New to Enkaji Trade Kenya?</h3>
                  <p className="text-sm text-orange-700">Join Kenya's leading B2B marketplace</p>
                </div>
                <Link href="/sign-up">
                  <Button className="bg-orange-600 hover:bg-orange-700 transition-colors">Sign Up</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-900">Want to Start Selling?</h3>
                  <p className="text-sm text-red-700">Reach customers across Kenya and beyond</p>
                </div>
                <Link href="/sell">
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent transition-colors"
                  >
                    Start Selling
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
