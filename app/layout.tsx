import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/providers/cart-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Enkaji Trade Kenya - Kenya's B2B Marketplace",
  description:
    "Connect with businesses across Kenya. Buy and sell products, find suppliers, and grow your business with Kenya's leading B2B marketplace.",
  keywords: "Kenya, B2B, marketplace, trade, business, suppliers, products, wholesale",
  authors: [{ name: "Enkaji Trade Kenya" }],
  creator: "Enkaji Trade Kenya",
  publisher: "Enkaji Trade Kenya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Enkaji Trade Kenya - Kenya's B2B Marketplace",
    description: "Connect with businesses across Kenya. Buy and sell products, find suppliers, and grow your business.",
    url: "/",
    siteName: "Enkaji Trade Kenya",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkaji Trade Kenya - Kenya's B2B Marketplace",
    description: "Connect with businesses across Kenya. Buy and sell products, find suppliers, and grow your business.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#ea580c", // orange-600
          colorBackground: "#ffffff",
          colorInputBackground: "#ffffff",
          colorInputText: "#374151", // gray-700
        },
        elements: {
          formButtonPrimary: "bg-orange-600 hover:bg-orange-700 text-white normal-case",
          card: "shadow-lg",
          headerTitle: "text-gray-900",
          headerSubtitle: "text-gray-600",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
