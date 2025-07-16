import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">KenyaTrade</span>
              <span className="text-sm text-gray-500 -mt-1">B2B Marketplace</span>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Sign In Component */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-0">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white border border-gray-300 hover:bg-gray-50",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  footerActionLink: "text-blue-600 hover:text-blue-700",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  formFieldInput: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                  formFieldLabel: "text-gray-700 font-medium",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                },
              }}
              redirectUrl="/dashboard"
              signUpUrl="/sign-up"
            />
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="mt-8 space-y-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">New to KenyaTrade?</h3>
                  <p className="text-sm text-blue-700">Join thousands of businesses</p>
                </div>
                <Link href="/sign-up">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900">Want to Sell?</h3>
                  <p className="text-sm text-green-700">Become a verified supplier</p>
                </div>
                <Link href="/sign-up?type=supplier">
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    Join as Supplier
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
