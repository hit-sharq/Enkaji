import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import AuthLayout from "@/components/auth/auth-layout"

export const metadata = {
  title: "Create account • Enkaji Trade Kenya",
  description: "Join Enkaji to buy, sell, or register as an artisan or supplier.",
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started in minutes—sell, source, and grow on Enkaji"
      footer={
        <>
          {"Already have an account? "}
          <Link href="/sign-in" className="font-medium text-orange-600 hover:text-orange-700">
            Sign in
          </Link>
        </>
      }
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#ea580c",
            colorText: "#0a0a0a",
            colorTextSecondary: "#6b7280",
            colorBackground: "#ffffff",
            borderRadius: "0.5rem",
          },
          elements: {
            rootBox: "w-full",
            card: "shadow-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formFieldInput:
              "h-10 rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm focus-visible:ring-2 focus-visible:ring-ring",
            formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white h-10 rounded-md transition-colors",
            socialButtonsBlockButton: "h-10 rounded-md border border-input bg-white hover:bg-orange-50 text-gray-900",
            footerAction__signUp: "text-sm",
            footerActionLink: "text-orange-600 hover:text-orange-700 font-medium",
          },
        }}
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      />
      <div className="text-xs text-muted-foreground">
        {"By creating an account, you agree to our "}
        <Link href="/terms" className="underline underline-offset-4">
          Terms
        </Link>
        {" and "}
        <Link href="/privacy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        {"."}
      </div>
    </AuthLayout>
  )
}
