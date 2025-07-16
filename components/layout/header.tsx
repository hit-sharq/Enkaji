"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart, User, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/components/providers/cart-provider"
import { UserButton, useUser } from "@clerk/nextjs"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { items } = useCart()
  const { isSignedIn } = useUser()

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-800 to-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-playfair text-2xl font-bold text-red-800">Enkaji</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-red-800 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="text-gray-700 hover:text-red-800 transition-colors">
              Shop
            </Link>
            <Link href="/artisans" className="text-gray-700 hover:text-red-800 transition-colors">
              Artisans
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-red-800 transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-red-800 transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-red-800 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Search crafts..." className="pl-10 border-gray-300 focus:border-red-800" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">
                  <User className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-red-800 transition-colors">
                Home
              </Link>
              <Link href="/shop" className="text-gray-700 hover:text-red-800 transition-colors">
                Shop
              </Link>
              <Link href="/artisans" className="text-gray-700 hover:text-red-800 transition-colors">
                Artisans
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-red-800 transition-colors">
                About
              </Link>
              <Link href="/blog" className="text-gray-700 hover:text-red-800 transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-red-800 transition-colors">
                Contact
              </Link>
              <div className="pt-4">
                <Input placeholder="Search crafts..." className="border-gray-300" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
