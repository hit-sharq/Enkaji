"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, MapPin, Star, Clock, Filter, 
  Scissors, Car, Home, GraduationCap, Heart, 
  Wrench, Camera, Music, Dumbbell, ChefHat, Stethoscope,
  ArrowRight, CheckCircle, Loader2
} from "lucide-react"

interface Service {
  id: string
  name: string
  slug: string
  description: string
  category: string
  price: number
  duration: number
  images: string[]
  location: string
  city: string
  provider: {
    businessName: string
    slug: string
    isVerified: boolean
  }
  averageRating: number
  totalReviews: number
}

interface ServiceCategory {
  name: string
  slug: string
  count: number
}

const categoryIcons: Record<string, any> = {
  beauty: Heart,
  barbershop: Scissors,
  home: Home,
  automotive: Car,
  tutoring: GraduationCap,
  fitness: Dumbbell,
  photography: Camera,
  events: Music,
  repairs: Wrench,
  catering: ChefHat,
  professional: Stethoscope,
}

const staticCategories: ServiceCategory[] = [
  { name: "Beauty & Salon", slug: "beauty", count: 234 },
  { name: "Barbershops", slug: "barbershop", count: 156 },
  { name: "Home Services", slug: "home", count: 312 },
  { name: "Automotive", slug: "automotive", count: 89 },
  { name: "Tutoring", slug: "tutoring", count: 178 },
  { name: "Health & Fitness", slug: "fitness", count: 67 },
  { name: "Photography", slug: "photography", count: 94 },
  { name: "Events", slug: "events", count: 145 },
  { name: "Repairs", slug: "repairs", count: 201 },
  { name: "Catering", slug: "catering", count: 78 },
  { name: "Professional", slug: "professional", count: 56 },
]

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [location, setLocation] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (selectedCategory) params.set("category", selectedCategory)
        if (location) params.set("location", location)
        if (searchQuery) params.set("search", searchQuery)

        const res = await fetch(`/api/services?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setServices(data.services || [])
        }
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(fetchServices, 300)
    return () => clearTimeout(debounce)
  }, [selectedCategory, location, searchQuery])

  const filteredServices = services.length > 0 ? services : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#8B2635] to-[#6B1D2A] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Book Local Services
            </h1>
            <p className="text-xl text-red-100 mb-8">
              Find and book appointments with top-rated service providers in Kenya
            </p>
            
            {/* Search */}
            <div className="flex flex-col md:flex-row gap-3 bg-white rounded-lg p-2">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Search services..." 
                  className="border-0 focus-visible:ring-0 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center gap-2 px-3 border-l">
                <MapPin className="h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Location (e.g. Nairobi)" 
                  className="border-0 focus-visible:ring-0 bg-transparent"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <Button className="bg-[#8B2635] hover:bg-[#7a1f2e] px-8">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button 
              variant={!selectedCategory ? "default" : "outline"}
              className={!selectedCategory ? "bg-[#8B2635]" : ""}
              onClick={() => setSelectedCategory(null)}
            >
              All Services
            </Button>
            {staticCategories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Heart
              return (
                <Button
                  key={cat.slug}
                  variant={selectedCategory === cat.slug ? "default" : "outline"}
                  className={selectedCategory === cat.slug ? "bg-[#8B2635]" : ""}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {cat.name}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedCategory 
                  ? staticCategories.find(c => c.slug === selectedCategory)?.name 
                  : "Popular Services"
                }
              </h2>
              <p className="text-gray-600">
                {loading ? "Loading..." : `${filteredServices.length} services found`}
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-video rounded-t-lg" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Link href={`/services/${service.id}`} key={service.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="aspect-video bg-gray-200 rounded-t-lg relative">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <Clock className="h-12 w-12" />
                      </div>
                      {service.provider.isVerified && (
                        <Badge className="absolute top-3 left-3 bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-[#8B2635] font-medium mb-1">{service.category}</p>
                      <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{service.provider.businessName}</p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{service.averageRating?.toFixed(1) || "0.0"}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{service.totalReviews || 0} reviews</span>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin className="h-3 w-3" />
                          {service.city}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <span className="text-2xl font-bold text-[#8B2635]">KSh {Number(service.price).toLocaleString()}</span>
                          <span className="text-gray-500 text-sm"> / {service.duration}min</span>
                        </div>
                        <Button size="sm" className="bg-[#8B2635] hover:bg-[#7a1f2e]">
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">
                Be the first to register as a service provider in this category!
              </p>
              <Link href="/services/register">
                <Button className="bg-[#8B2635]">
                  Register as Provider
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-[#8B2635] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Service Provider?</h2>
          <p className="text-xl text-red-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals growing their business on Enkaji
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/services/register">
              <Button size="lg" className="bg-white text-[#8B2635] hover:bg-gray-100">
                Register as Provider
              </Button>
            </Link>
            <Link href="/dashboard/services">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#8B2635]">
                Provider Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}