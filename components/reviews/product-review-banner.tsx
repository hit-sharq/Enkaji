"use client"

import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ProductReviewBannerProps {
  rating: number
  comment: string
  reviewerName?: string
  className?: string
}

export function ProductReviewBanner({ rating, comment, reviewerName, className = "" }: ProductReviewBannerProps) {
  return (
    <Card className={`border-l-4 border-enkaji-ochre bg-gray-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-gray-700 italic">"{comment}"</p>
        {reviewerName && (
          <p className="text-sm text-gray-500 mt-2">- {reviewerName}</p>
        )}
      </CardContent>
    </Card>
  )
}