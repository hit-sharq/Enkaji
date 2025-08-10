"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

type Category = {
  id: string
  name: string
  _count?: {
    products: number
  }
}

export function ShopFilters({ categories }: { categories: Category[] }) {
  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold mb-2">Categories</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2">
              <Checkbox />
              <Label className="flex-1 cursor-pointer">
                {cat.name}
                {typeof cat._count?.products === "number" && (
                  <span className="text-gray-500 ml-2 text-xs">({cat._count.products})</span>
                )}
              </Label>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
