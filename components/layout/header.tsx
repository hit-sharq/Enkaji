"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Search, ShoppingCart, Heart, User, Store, Shield, Package, Settings, LogOut, Smartphone, MessageSquare, ChevronDown, Sun, Moon } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

export function Header() {
  const { user, isLoaded } = useUser()
  const cart = useCart()
  const { theme, setTheme } = useTheme()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.id) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3000)

          const response = await fetch("/api/auth/check-admin", {
            signal: controller.signal,
          })
          clearTimeout(timeoutId)

          const data = await response.json()
          setIsAdmin(data.isAdmin)
        } catch {
          setIsAdmin(false)
        }
      } else {
        setIsAdmin(false)
      }
    }

    const timeoutId = setTimeout(checkAdminStatus, 100)
    return () => clearTimeout(timeoutId)
  }, [user])

  const cartItemsCount = cart.state.items.reduce((total: number, item: any) => total + item.quantity, 0)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  if (!isLoaded) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-enkaji-orange to-enkaji-charcoal shadow-card">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight">
                <span className="text-enkaji-orange">Enkaji</span> <span className="text-foreground">Trade Kenya</span>
              </span>
              <span className="-mt-0.5 text-[11px] tracking-wide text-muted-foreground">Kenya's B2B Marketplace</span>
            </div>
          </Link>
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-enkaji-orange to-enkaji-charcoal shadow-card">
            <Store className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight tracking-tight">
              <span className="text-enkaji-orange">Enkaji</span> <span className="text-foreground">Trade Kenya</span>
            </span>
            <span className="-mt-0.5 text-[11px] tracking-wide text-muted-foreground">Kenya's B2B Marketplace</span>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:block">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, sellers, and businesses across Kenya..."
              className="h-10 w-full rounded-full border-border bg-muted/40 pl-10 pr-4 focus:border-enkaji-orange focus:bg-background"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link
            href="/shop"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-enkaji-orange"
          >
            Shop
          </Link>

          <Link
            href="/sellers"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-enkaji-orange"
          >
            Sellers
          </Link>

          <Link
            href="/services"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-enkaji-orange"
          >
            Services
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange">
                Categories
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-xl border-border/60 shadow-elevated">
              <DropdownMenuItem asChild>
                <Link href="/categories/electronics">Electronics & Technology</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/computers-it">Computers & IT</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/mobile-phones">Mobile Phones</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/fashion-apparel">Fashion & Apparel</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/textiles-fabrics">Textiles & Fabrics</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/home-appliances">Home Appliances</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/agriculture-farming">Agriculture & Farming</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/food-beverages">Food & Beverages</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/construction-materials">Construction Materials</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/automotive-parts">Automotive Parts</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/vehicles-transport">Vehicles & Transport</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/categories/health-medical">Health & Medical</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/categories">View All Categories</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="/about"
            className="rounded-full px-3.5 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/60 hover:text-enkaji-orange"
          >
            About
          </Link>

          <Link href="/download">
            <Button size="sm" className="ml-1 rounded-full bg-enkaji-orange px-4 font-medium text-white hover:bg-enkaji-orange/90">
              <Smartphone className="mr-1.5 h-4 w-4" />
              Get App
            </Button>
          </Link>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 bg-enkaji-orange text-[11px] font-bold text-enkaji-ink">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Favorites */}
          <Link href="/favorites">
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* User Menu */}
          {isLoaded && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/60 shadow-elevated">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/favorites" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" />
                    Favorites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center text-enkaji-orange">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/sell" className="flex items-center">
                    <Store className="mr-2 h-4 w-4" />
                    Start Selling
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="rounded-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="rounded-full bg-enkaji-orange font-medium text-white hover:bg-enkaji-orange/90">
                  Join Now
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-1 lg:hidden">
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 bg-enkaji-orange text-[11px] font-bold text-enkaji-ink">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] sm:w-80">
              <div className="mt-6 flex flex-col space-y-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="rounded-full pl-10"
                  />
                </form>

                {/* Theme Toggle */}
                <Button
                  variant="outline"
                  className="w-full rounded-xl justify-start"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </Button>

                {/* Mobile Navigation */}
                <nav className="flex flex-col space-y-1">
                  <Link
                    href="/shop"
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                    onClick={() => setIsOpen(false)}
                  >
                    Shop
                  </Link>
                  <Link
                    href="/sellers"
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                    onClick={() => setIsOpen(false)}
                  >
                    Sellers
                  </Link>
                  <Link
                    href="/services"
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                    onClick={() => setIsOpen(false)}
                  >
                    Services
                  </Link>
                  <Link
                    href="/categories"
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                    onClick={() => setIsOpen(false)}
                  >
                    Categories
                  </Link>
                  <Link
                    href="/about"
                    className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                    onClick={() => setIsOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/download"
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-enkaji-orange hover:bg-muted/60"
                    onClick={() => setIsOpen(false)}
                  >
                    <Smartphone className="h-4 w-4" />
                    Get the App
                  </Link>
                  {isLoaded && user && (
                    <>
                      <Link
                        href="/dashboard"
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                        onClick={() => setIsOpen(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        href="/orders"
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                        onClick={() => setIsOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/favorites"
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-muted/60 hover:text-enkaji-orange"
                        onClick={() => setIsOpen(false)}
                      >
                        Favorites
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="rounded-xl px-3 py-2.5 text-sm font-medium text-enkaji-orange hover:bg-muted/60"
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                    </>
                  )}
                </nav>

                <div className="border-t pt-4">
                  <Link href="/sell">
                    <Button className="mb-3 w-full rounded-full bg-enkaji-orange font-medium text-white hover:bg-enkaji-orange/90">Start Selling</Button>
                  </Link>
                  {!isLoaded || !user ? (
                    <Link href="/sign-in">
                      <Button variant="outline" className="w-full rounded-full bg-transparent">
                        Sign In
                      </Button>
                    </Link>
                  ) : (
                    <div className="flex justify-center">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
