"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

type Category = {
  id: string
  name: string
  _count?: {
    products: number
  }
}

interface ShopFiltersProps {
  categories: Category[]
}

export function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [isOpen, setIsOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","))
    }
    if (minPrice && maxPrice) {
      setPriceRange([Number.parseInt(minPrice), Number.parseInt(maxPrice)])
    }
  }, [searchParams])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    let newCategories: string[]
    if (checked) {
      newCategories = [...selectedCategories, categoryId]
    } else {
      newCategories = selectedCategories.filter((id) => id !== categoryId)
    }
    setSelectedCategories(newCategories)
    updateURL(newCategories, priceRange)
  }

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange)
    updateURL(selectedCategories, newRange)
  }

  const updateURL = (categories: string[], price: number[]) => {
    const params = new URLSearchParams(searchParams.toString())

    if (categories.length > 0) {
      params.set("category", categories.join(","))
    } else {
      params.delete("category")
    }

    if (price[0] > 0 || price[1] < 100000) {
      params.set("minPrice", price[0].toString())
      params.set("maxPrice", price[1].toString())
    } else {
      params.delete("minPrice")
      params.delete("maxPrice")
    }

    router.push(`/shop?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 100000])
    router.push("/shop")
  }

  const activeFiltersCount = selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < 100000 ? 1 : 0)

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filters Content */}
      <div className={`space-y-6 ${!isOpen ? "hidden lg:block" : ""}`}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-600 hover:text-red-700">
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Categories Filter */}
            <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline">
                <h3 className="font-semibold text-base">Categories</h3>
                {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-3 mt-3">
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                      />
                      <Label htmlFor={category.id} className="flex-1 cursor-pointer text-sm leading-relaxed">
                        <div className="flex items-center justify-between">
                          <span>{category.name}</span>
                          {category._count?.products !== undefined && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {category._count.products}
                            </Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Price Range Filter */}
            <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-0 hover:no-underline">
                <h3 className="font-semibold text-base">Price Range</h3>
                {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>

              <CollapsibleContent className="space-y-4 mt-3">
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceChange}
                    max={100000}
                    min={0}
                    step={1000}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>KSh {priceRange[0].toLocaleString()}</span>
                  <span>KSh {priceRange[1].toLocaleString()}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePriceChange([0, 10000])} className="text-xs">
                    Under 10K
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceChange([10000, 50000])}
                    className="text-xs"
                  >
                    10K - 50K
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceChange([50000, 100000])}
                    className="text-xs"
                  >
                    50K - 100K
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePriceChange([100000, 1000000])}
                    className="text-xs"
                  >
                    100K+
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId)
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="flex items-center gap-1">
                      {category.name}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => handleCategoryChange(categoryId, false)} />
                    </Badge>
                  ) : null
                })}
                {(priceRange[0] > 0 || priceRange[1] < 100000) && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    KSh {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => handlePriceChange([0, 100000])} />
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
