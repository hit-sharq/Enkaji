"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Search, TrendingUp, Shield, Globe } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full" />
        <div className="absolute top-40 right-20 w-24 h-24 border border-white/20 rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Kenya's Leading
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                B2B Marketplace
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Connect with thousands of verified sellers and businesses across all 47 counties of Kenya. Source
              products, compare prices, and grow your business on East Africa's most trusted B2B platform.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-12">
              <div className="relative bg-white rounded-full p-2 shadow-2xl">
                <div className="flex items-center">
                  <Search className="absolute left-6 text-gray-400 w-5 h-5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for products, sellers, businesses, or categories across Kenya..."
                    className="flex-1 pl-14 pr-4 h-14 text-lg border-0 bg-transparent text-gray-900 placeholder:text-gray-500 focus:ring-0"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-8 bg-orange-500 hover:bg-orange-600 rounded-full text-white font-semibold"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/shop">
                <Button
                  size="lg"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg rounded-full shadow-lg"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/sell">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg rounded-full bg-transparent"
                >
                  Start Selling
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">1M+</div>
                <div className="text-blue-200 text-sm md:text-base">Products Listed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">50K+</div>
                <div className="text-blue-200 text-sm md:text-base">Active Sellers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">47</div>
                <div className="text-blue-200 text-sm md:text-base">Counties Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">KSh 10B+</div>
                <div className="text-blue-200 text-sm md:text-base">Trade Volume</div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur rounded-lg p-4">
              <Shield className="w-8 h-8 text-green-400" />
              <div>
                <div className="font-semibold">Trade Assurance</div>
                <div className="text-sm text-blue-200">100% Secure Transactions</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur rounded-lg p-4">
              <Globe className="w-8 h-8 text-blue-400" />
              <div>
                <div className="font-semibold">Nationwide Coverage</div>
                <div className="text-sm text-blue-200">All 47 Counties</div>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur rounded-lg p-4">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="font-semibold">Growing Fast</div>
                <div className="text-sm text-blue-200">Join 200K+ Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
