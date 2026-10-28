import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import AuthLayout from "@/components/auth/auth-layout"

export const metadata = {
  title: "Sign in • Enkaji Trade Kenya",
  description: "Access your Enkaji account to manage your orders, products, and more.",
}

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to Enkaji Trade Kenya"
      footer={
        <>
          {"Don't have an account? "}
      <Link href="/sign-up" className="font-medium text-enkaji-orange hover:text-enkaji-orange/80">
        Create one
      </Link>
        </>
      }
    >
      <SignIn
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
            footerAction__signIn: "text-sm",
            footerActionLink: "text-enkaji-orange hover:text-enkaji-orange/80 font-medium",
          },
        }}
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
      />
      <div className="text-xs text-muted-foreground">
        {"Having trouble? "}
        <Link href="/contact" className="underline underline-offset-4">
          Contact support
        </Link>
        {" or "}
        <Link href="/faq" className="underline underline-offset-4">
          read FAQs
        </Link>
        {"."}
      </div>
    </AuthLayout>
  )
}
