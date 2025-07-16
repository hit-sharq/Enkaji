"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Search, ShoppingCart, Menu, Heart, User, Package, Settings, LogOut, Store, Shield } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const { items } = useCart()
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Check if user is admin
  useEffect(() => {
    if (user?.emailAddresses?.[0]?.emailAddress) {
      const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || []
      setIsAdmin(adminEmails.includes(user.emailAddresses[0].emailAddress))
    }
  }, [user])

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
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">Enkaji</span>
              <span className="text-xs text-gray-500 -mt-1">Masai Marketplace</span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search authentic Masai crafts and products..."
                className="pl-10 pr-4 h-10 w-full border-gray-300 focus:border-orange-500"
              />
              <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 bg-orange-600 hover:bg-orange-700">
                Search
              </Button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/shop" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Shop
            </Link>

            <Link href="/artisans" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              Artisans
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700 hover:text-orange-600 font-medium">
                  Categories
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/categories/jewelry-accessories">Jewelry & Accessories</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/traditional-clothing">Traditional Clothing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/home-decor">Home Decor</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/categories/art-sculptures">Art & Sculptures</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/categories">View All Categories</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
              About
            </Link>

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center text-blue-600">
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/artisan/register" className="flex items-center">
                      <Store className="w-4 h-4 mr-2" />
                      Become an Artisan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
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
                      href="/shop"
                      className="text-gray-700 hover:text-orange-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Shop
                    </Link>
                    <Link
                      href="/artisans"
                      className="text-gray-700 hover:text-orange-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Artisans
                    </Link>
                    <Link
                      href="/categories"
                      className="text-gray-700 hover:text-orange-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Categories
                    </Link>
                    <Link
                      href="/about"
                      className="text-gray-700 hover:text-orange-600 font-medium py-2"
                      onClick={() => setIsOpen(false)}
                    >
                      About
                    </Link>
                    {isSignedIn && (
                      <>
                        <Link
                          href="/dashboard"
                          className="text-gray-700 hover:text-orange-600 font-medium py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          href="/orders"
                          className="text-gray-700 hover:text-orange-600 font-medium py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          href="/favorites"
                          className="text-gray-700 hover:text-orange-600 font-medium py-2"
                          onClick={() => setIsOpen(false)}
                        >
                          Favorites
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="text-blue-600 hover:text-blue-700 font-medium py-2"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                      </>
                    )}
                  </nav>

                  <div className="border-t pt-4">
                    <Link href="/artisan/register">
                      <Button className="w-full mb-3 bg-orange-600 hover:bg-orange-700">Become an Artisan</Button>
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
