"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, ShoppingCart, Menu, Globe, Heart } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { UserButton, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { items } = useCart()
  const { isSignedIn } = useUser()
  const router = useRouter()

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">KenyaTrade</span>
              <span className="text-xs text-gray-500 -mt-1">B2B Marketplace</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, suppliers, or categories..."
                className="pl-10 pr-4 h-10 w-full border-gray-300 focus:border-blue-500"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 bg-blue-600 hover:bg-blue-700">
                Search
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/categories/electronics">Electronics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/fashion-apparel">Fashion & Apparel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/agriculture-farming">Agriculture</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/construction-materials">Construction</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/categories">View All Categories</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/suppliers" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Suppliers
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 font-medium">
                  Services
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/services/logistics">Logistics & Shipping</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services/financing">Trade Financing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services/verification">Supplier Verification</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/services/insurance">Trade Insurance</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Favorites */}
            <Link href="/favorites">
              <Button variant="ghost" size="sm">
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            {/* User Menu */}
            {isSignedIn ? (
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu */}
          <div className="lg:hidden flex items-center space-x-2">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="sm">
                <ShoppingCart className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="pl-10"
                    />
                  </form>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    <Link
                      href="/categories"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/suppliers"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Suppliers
                    </Link>
                    <Link
                      href="/services"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Services
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/favorites"
                      className="text-gray-700 hover:text-blue-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Favorites
                    </Link>
                  </nav>

                  <div className="border-t pt-4">
                    <Link href="/sign-up?type=supplier">
                      <Button className="w-full mb-3 bg-blue-600 hover:bg-blue-700">Become a Supplier</Button>
                    </Link>
                    {!isSignedIn && (
                      <Link href="/sign-in">
                        <Button variant="outline" className="w-full bg-transparent">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
