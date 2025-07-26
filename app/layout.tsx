import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { CartProvider } from "@/components/providers/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Enkaji Trade Kenya - Kenya's Leading B2B Marketplace",
  description:
    "Connect with thousands of verified artisans and businesses across Kenya. Source products, compare prices, and grow your business on East Africa's most trusted B2B platform.",
  keywords: "Kenya B2B marketplace, artisans, wholesale, trade, business, sourcing, Enkaji Trade Kenya",
  authors: [{ name: "Enkaji Trade Kenya Team" }],
  creator: "Enkaji Trade Kenya",
  publisher: "Enkaji Trade Kenya",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://enkajitradekenya.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Enkaji Trade Kenya - Kenya's Leading B2B Marketplace",
    description:
      "Connect with thousands of verified artisans and businesses across Kenya. Source products, compare prices, and grow your business.",
    url: "https://enkajitradekenya.com",
    siteName: "Enkaji Trade Kenya",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Enkaji Trade Kenya B2B Marketplace",
      },
    ],
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Enkaji Trade Kenya - Kenya's Leading B2B Marketplace",
    description: "Connect with thousands of verified artisans and businesses across Kenya.",
    images: ["/og-image.jpg"],
    creator: "@enkajitradekenya",
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
  verification: {
    google: "your-google-verification-code",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
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
