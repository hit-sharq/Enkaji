import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/components/providers/cart-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: "Enkaji - Authentic Masai Handmade Crafts",
  description:
    "Discover authentic handmade crafts from talented Masai artisans in Kenya. Support local communities while owning unique, culturally-rich pieces.",
  keywords: "Masai crafts, handmade, Kenya, artisans, authentic, cultural, marketplace",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} ${playfair.variable} font-sans`}>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
