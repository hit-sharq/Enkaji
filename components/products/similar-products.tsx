"use client"

import { useEffect, useState } from "react"
import { ProductCard } from "./product-card"

interface SimilarProductsProps {
  categoryName: string
  currentProductId: string
}

export function SimilarProducts({ categoryName, currentProductId }: SimilarProductsProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        const response = await fetch(`/api/products?categoryName=${encodeURIComponent(categoryName)}&limit=4&exclude=${currentProductId}`)
        const data = await response.json()
        if (response.ok) {
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error("Error fetching similar products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSimilarProducts()
  }, [categoryName, currentProductId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="aspect-[4/3] bg-muted rounded-t-2xl" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}