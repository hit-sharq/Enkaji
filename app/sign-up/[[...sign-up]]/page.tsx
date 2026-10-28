import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import AuthLayout from "@/components/auth/auth-layout"

export const metadata = {
  title: "Create account • Enkaji Trade Kenya",
  description: "Join Enkaji to buy, sell, or register as a seller. Create your account in minutes and start trading with verified Kenyan businesses.",
}

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Get started in minutes—sell, source, and grow on Enkaji"
      footer={
        <>
          {"Already have an account? "}
      <Link href="/sign-in" className="font-medium text-enkaji-orange hover:text-enkaji-orange/80">
        Sign in
      </Link>
        </>
      }
    >
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "#F36A1B",
            colorText: "#0a0a0a",
            colorTextSecondary: "#6b7280",
            colorBackground: "#ffffff",
            borderRadius: "0.75rem",
          },
          elements: {
            rootBox: "w-full",
            card: "shadow-none",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formFieldInput:
              "h-11 rounded-xl border border-input bg-background px-3.5 py-2 text-base md:text-sm focus-visible:ring-2 focus-visible:ring-enkaji-orange/30 focus-visible:border-enkaji-orange",
            formButtonPrimary: "bg-enkaji-orange hover:bg-enkaji-orange/90 text-white h-11 rounded-xl font-semibold transition-colors",
            socialButtonsBlockButton: "h-11 rounded-xl border border-input bg-card hover:bg-enkaji-orange/10 text-enkaji-ink",
            footerAction__signUp: "text-sm",
            footerActionLink: "text-enkaji-orange hover:text-enkaji-orange/80 font-medium",
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
