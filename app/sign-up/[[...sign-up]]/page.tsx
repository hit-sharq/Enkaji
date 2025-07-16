import { SignUp } from "@clerk/nextjs"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Globe, ArrowLeft, Store, User } from "lucide-react"

export default function SignUpPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const userType = searchParams.type || "buyer"

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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join KenyaTrade</h1>
          <p className="text-gray-600">
            {userType === "supplier"
              ? "Start selling to thousands of buyers"
              : "Connect with verified suppliers nationwide"}
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
            <Link
              href="/sign-up?type=buyer"
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                userType === "buyer" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4 mr-2" />
              Buyer
            </Link>
            <Link
              href="/sign-up?type=supplier"
              className={`flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                userType === "supplier" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Store className="w-4 h-4 mr-2" />
              Supplier
            </Link>
          </div>
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
              signInUrl="/sign-in"
            />
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-8">
          <Card className={userType === "supplier" ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
            <CardContent className="p-4">
              <h3 className={`font-semibold mb-3 ${userType === "supplier" ? "text-green-900" : "text-blue-900"}`}>
                {userType === "supplier" ? "Supplier Benefits:" : "Buyer Benefits:"}
              </h3>
              <ul className={`space-y-2 text-sm ${userType === "supplier" ? "text-green-700" : "text-blue-700"}`}>
                {userType === "supplier" ? (
                  <>
                    <li>• Reach 100K+ potential buyers</li>
                    <li>• List unlimited products</li>
                    <li>• Secure payment processing</li>
                    <li>• Marketing & promotion tools</li>
                  </>
                ) : (
                  <>
                    <li>• Access to 25K+ verified suppliers</li>
                    <li>• Compare prices & quality</li>
                    <li>• Secure transactions</li>
                    <li>• Bulk ordering discounts</li>
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-medium">
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
