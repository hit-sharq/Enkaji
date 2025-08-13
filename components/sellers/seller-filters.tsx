"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, MapPin, Building, Shield } from "lucide-react"

const KENYA_CITIES = [
  "All Locations",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
  "Machakos",
  "Meru",
  "Nyeri",
  "Kericho",
  "Embu",
]

const BUSINESS_TYPES = [
  "All Types",
  "Manufacturer",
  "Wholesaler",
  "Distributor",
  "Retailer",
  "Service Provider",
  "Importer",
  "Exporter",
]

export function SellerFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [location, setLocation] = useState(searchParams.get("location") || "All Locations")
  const [businessType, setBusinessType] = useState(searchParams.get("businessType") || "All Types")
  const [verified, setVerified] = useState(searchParams.get("verified") === "true")
  const [isOpen, setIsOpen] = useState(false)

  // Get active filters for display
  const getActiveFilters = () => {
    const filters = []
    if (search) filters.push({ key: "search", value: search, label: `Search: ${search}` })
    if (location && location !== "All Locations")
      filters.push({ key: "location", value: location, label: `Location: ${location}` })
    if (businessType && businessType !== "All Types")
      filters.push({ key: "businessType", value: businessType, label: `Type: ${businessType}` })
    if (verified) filters.push({ key: "verified", value: "true", label: "Verified Only" })
    return filters
  }

  const updateURL = () => {
    const params = new URLSearchParams()

    if (search) params.set("search", search)
    if (location && location !== "All Locations") params.set("location", location)
    if (businessType && businessType !== "All Types") params.set("businessType", businessType)
    if (verified) params.set("verified", "true")

    const queryString = params.toString()
    router.push(`/sellers${queryString ? `?${queryString}` : ""}`)
  }

  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case "search":
        setSearch("")
        break
      case "location":
        setLocation("All Locations")
        break
      case "businessType":
        setBusinessType("All Types")
        break
      case "verified":
        setVerified(false)
        break
    }
  }

  const clearAllFilters = () => {
    setSearch("")
    setLocation("All Locations")
    setBusinessType("All Types")
    setVerified(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateURL()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [search, location, businessType, verified])

  const activeFilters = getActiveFilters()

  return (
    <div className="space-y-6">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </Button>
      </div>

      {/* Filters Card */}
      <Card className={`${isOpen ? "block" : "hidden"} lg:block`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filter Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Suppliers
            </Label>
            <Input
              id="search"
              placeholder="Search by business name or owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Location Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {KENYA_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Type Filter */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Business Type
            </Label>
            <Select value={businessType} onValueChange={setBusinessType}>
              <SelectTrigger>
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Verification Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox id="verified" checked={verified} onCheckedChange={(checked) => setVerified(checked === true)} />
            <Label htmlFor="verified" className="flex items-center gap-2 cursor-pointer">
              <Shield className="w-4 h-4 text-green-600" />
              Verified suppliers only
            </Label>
          </div>

          {/* Clear Filters */}
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="flex items-center gap-1 pr-1">
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeFilter(filter.key)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
