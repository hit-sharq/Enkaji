"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Home, 
  Search, 
  MapPin, 
  ArrowLeft, 
  Phone, 
  Mail,
  MessageCircle,
  Package,
  ShoppingBag,
  TrendingUp
} from "lucide-react"

function NotFoundContent() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const popularCategories = [
    { name: "Electronics", icon: "📱", href: "/categories/electronics" },
    { name: "Fashion", icon: "👗", href: "/categories/fashion-apparel" },
    { name: "Home & Garden", icon: "🏠", href: "/categories/home-garden" },
    { name: "Automotive", icon: "🚗", href: "/categories/automotive" },
  ]

  const quickLinks = [
    { name: "Browse All Products", href: "/shop", icon: ShoppingBag },
    { name: "Track Your Order", href: "/orders", icon: Package },
    { name: "Latest Trends", href: "/blog", icon: TrendingUp },
    { name: "Find Nearby Sellers", href: "/sellers", icon: MapPin },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-background via-background to-enkaji-cream/20 dark:from-background dark:via-background dark:to-enkaji-brown/20">
      {/* Animated Background Elements */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 38, 53, 0.05) 0%, transparent 50%)`,
        }}
      />
      
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-enkaji-red/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-enkaji-ochre/5 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/3 right-20 w-32 h-32 bg-enkaji-gold/5 rounded-full blur-2xl animate-float" />
      <div className="absolute bottom-1/3 left-20 w-24 h-24 bg-enkaji-brown/5 rounded-full blur-xl animate-float-delayed" />

      {/* Breadcrumb decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown" />

      {/* Main 404 Card */}
      <Card 
        className={`w-full max-w-4xl relative z-10 border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-enkaji-red via-enkaji-ochre to-enkaji-brown p-[1px]">
          <div className="absolute inset-0 rounded-lg bg-white/80 dark:bg-gray-900/80" />
        </div>

        <CardContent className="relative p-8 md:p-12 flex flex-col items-center text-center space-y-8">
          {/* Large 404 with Icon */}
          <div className="relative group">
            <div className="absolute inset-0 bg-enkaji-red/10 rounded-full blur-2xl group-hover:bg-enkaji-red/20 transition-all duration-500" />
            <div className="relative" style={{ animation: "bounce-subtle 3s ease-in-out infinite" }}>
              <Search className="w-32 h-32 text-enkaji-ochre mx-auto mb-4" />
              <h1 className="text-9xl font-bold text-enkaji-gradient font-playfair tracking-tight animate-fade-in">
                404
              </h1>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
              The page you're looking for seems to have wandered off. 
              Don't worry, it happens to the best of us! Let's get you back on track.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-lg">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories, or sellers..."
                className="w-full px-6 py-4 pr-32 rounded-full border-2 border-enkaji-ochre/30 focus:border-enkaji-ochre focus:outline-none focus:ring-2 focus:ring-enkaji-ochre/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm transition-all duration-300"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 enkaji-button-primary rounded-full px-6"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Quick Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => window.location.href = "/"}
              className="enkaji-button-primary btn-hover-lift"
              size="lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
            <Button 
              onClick={() => window.location.href = "/shop"}
              className="enkaji-button-secondary btn-hover-lift"
              size="lg"
              variant="outline"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Browse Shop
            </Button>
            <Button 
              onClick={() => window.history.back()}
              className="btn-hover-lift"
              size="lg"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>

          {/* Popular Categories */}
          <div className="w-full pt-8 border-t border-border">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="h-px w-8 bg-enkaji-ochre/50" />
              <h3 className="text-lg font-semibold text-foreground">Popular Categories</h3>
              <span className="h-px w-8 bg-enkaji-ochre/50" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => window.location.href = category.href}
                  className="group p-4 rounded-xl bg-muted/50 hover:bg-enkaji-red/10 transition-all duration-300 border border-transparent hover:border-enkaji-red/20"
                >
                  <span className="text-4xl mb-2 block transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </span>
                  <span className="text-sm font-medium text-foreground group-hover:text-enkaji-red transition-colors">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-full pt-6 border-t border-border">
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-enkaji-red transition-colors duration-200"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="w-full p-6 bg-enkaji-gradient/5 rounded-xl border border-enkaji-ochre/20">
            <p className="text-sm text-muted-foreground mb-4">
              Can't find what you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/contact"}
                className="border-enkaji-ochre text-enkaji-ochre hover:bg-enkaji-ochre hover:text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
              <a href="tel:+254700000000" className="text-sm text-muted-foreground hover:text-enkaji-red flex items-center gap-1">
                <Phone className="w-4 h-4" />
                +254 700 000 000
              </a>
              <a href="mailto:support@enkaji.co.ke" className="text-sm text-muted-foreground hover:text-enkaji-red flex items-center gap-1">
                <Mail className="w-4 h-4" />
                support@enkaji.co.ke
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enkaji Branding Footer */}
      <div className="mt-8 text-center space-y-2 relative z-10">
        <p className="text-lg font-bold font-playfair text-enkaji-gradient">
          Enkaji Trade Kenya
        </p>
        <p className="text-sm text-muted-foreground">
          Kenya's Leading Marketplace • Connecting Businesses
        </p>
      </div>

      {/* Decorative bottom gradient */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-enkaji-brown via-enkaji-ochre to-enkaji-red" />
    </div>
  )
}

export default function NotFound() {
  return <NotFoundContent />
}

export { NotFoundContent }

