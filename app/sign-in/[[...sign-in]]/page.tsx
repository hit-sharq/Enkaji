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
          <Link href="/sign-up" className="font-medium text-enkaji-gold hover:text-enkaji-gold/80">
            Create one
          </Link>
        </>
      }
    >
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#C8B96A",
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
            formButtonPrimary: "bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink h-10 rounded-md font-semibold transition-colors",
            socialButtonsBlockButton: "h-10 rounded-md border border-input bg-card hover:bg-enkaji-gold/10 text-enkaji-ink",
            footerAction__signIn: "text-sm",
            footerActionLink: "text-enkaji-gold hover:text-enkaji-gold/80 font-medium",
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
