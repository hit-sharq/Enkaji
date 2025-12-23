"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote, Verified } from "lucide-react"

interface Testimonial {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  message: string
  subject?: string
  type: string
  createdAt: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
  className?: string
}

export function TestimonialCard({ testimonial, className = "" }: TestimonialCardProps) {
  // Transform the data to handle both old and new formats
  const displayName = testimonial.name || 
    (testimonial.firstName && testimonial.lastName 
      ? `${testimonial.firstName} ${testimonial.lastName}`
      : testimonial.firstName || testimonial.email?.split('@')[0] || "Anonymous")

  // Extract rating from subject if it exists
  const ratingMatch = testimonial.subject?.match(/Rating: (\d+)\/5/)
  const rating = ratingMatch ? parseInt(ratingMatch[1]) : 5

  // For now, we'll consider all testimonials as verified since they're from the contact form
  const isVerified = true

  return (
    <Card className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 enkaji-card-hover ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Quote className="w-8 h-8 text-enkaji-ochre mb-2" />
        </div>

        <p className="text-gray-700 mb-6 italic line-clamp-4">"{testimonial.message}"</p>

        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
          ))}
        </div>

        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-gradient-to-br from-enkaji-gold to-enkaji-ochre flex items-center justify-center">
            <span className="text-white font-bold text-lg">{displayName.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {displayName}
              {isVerified && (
                <Verified className="w-4 h-4 text-green-500" />
              )}
            </h4>
            <p className="text-sm text-gray-600">
              Customer
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(testimonial.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
