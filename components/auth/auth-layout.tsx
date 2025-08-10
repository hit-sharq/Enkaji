import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, Store, Users } from "lucide-react"

type AuthLayoutProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* Left panel - brand and benefits */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-rose-500 to-amber-500 opacity-90" />
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/10 blur-3xl" />

        <header className="relative z-10 px-10 pt-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <div className="h-9 w-9 rounded-md bg-white/15 grid place-items-center">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight">Enkaji Trade Kenya</span>
          </Link>
        </header>

        <section className="relative z-10 px-10">
          <h1 className="text-4xl font-bold text-white max-w-xl leading-tight">{"Trade simply. Grow faster."}</h1>
          <p className="mt-4 text-white/90 max-w-lg">
            {"Join Kenya’s leading marketplace connecting verified artisans, suppliers, and buyers."}
          </p>

          <ul className="mt-10 space-y-4 text-white/95">
            <li className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-md bg-white/20 grid place-items-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{"Verified sellers & artisans"}</p>
                <p className="text-white/85 text-sm">{"Quality assurance and trusted profiles."}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-1 h-6 w-6 rounded-md bg-white/20 grid place-items-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{"Powerful tools for growth"}</p>
                <p className="text-white/85 text-sm">{"Manage products, orders, and RFQs with ease."}</p>
              </div>
            </li>
          </ul>
        </section>

        <footer className="relative z-10 px-10 pb-10 text-white/85">
          <p className="text-sm">
            {"By continuing, you agree to our "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-white">
              Terms
            </Link>
            {" and "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
              Privacy Policy
            </Link>
            {"."}
          </p>
        </footer>
      </div>

      {/* Right panel - auth card */}
      <div className="flex min-h-screen items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-900">
              <div className="h-9 w-9 rounded-md bg-orange-500/10 text-orange-600 grid place-items-center">
                <Store className="h-5 w-5" />
              </div>
              <span className="text-lg font-semibold">Enkaji</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/">{"Back to home"}</Link>
            </Button>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
            </CardHeader>
            <CardContent className="space-y-4">{children}</CardContent>
          </Card>

          {footer ? <div className="mt-6 text-center text-sm text-gray-600">{footer}</div> : null}
        </div>
      </div>
    </main>
  )
}
