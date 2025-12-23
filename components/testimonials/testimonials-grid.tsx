"use client"

import { useState, useEffect } from "react"
import { TestimonialCard } from "./testimonial-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

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

interface TestimonialsGridProps {
  className?: string
  showAll?: boolean
  limit?: number
}

export function TestimonialsGrid({ className = "", showAll = true, limit }: TestimonialsGridProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchTestimonials()
  }, [showAll, limit])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (!showAll) {
        params.append("featured", "true")
      }
      if (limit) {
        params.append("limit", limit.toString())
      }

      const response = await fetch(`/api/testimonials?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        // Transform the data from Contact model to Testimonial interface
        const transformedTestimonials = (data.testimonials || []).map((contact: any) => ({
          id: contact.id,
          firstName: contact.firstName,
          lastName: contact.lastName,
          name: contact.firstName && contact.lastName 
            ? `${contact.firstName} ${contact.lastName}`
            : contact.firstName || contact.email?.split('@')[0] || "Anonymous",
          email: contact.email,
          message: contact.message,
          subject: contact.subject,
          type: contact.type,
          createdAt: contact.createdAt
        }))
        setTestimonials(transformedTestimonials)
      } else {
        setError(data.error || "Failed to fetch testimonials")
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      setError("Failed to load testimonials")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-16 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-enkaji-ochre" />
        <span className="ml-2 text-gray-600">Loading testimonials...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-red-600 mb-4">
          <p>Error loading testimonials: {error}</p>
        </div>
        <Button onClick={fetchTestimonials} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }
  if (testimonials.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-enkaji-gold to-enkaji-ochre flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Testimonials Yet</h3>
          <p className="text-gray-600 mb-6">
            We're still collecting testimonials from our valued customers. Check back soon to see what they have to say!
          </p>
          <a
            href="/testimonials/submit"
            className="inline-flex items-center px-6 py-3 bg-enkaji-red text-white rounded-lg hover:bg-enkaji-red/90 transition-colors"
          >
            Be the First to Share Your Story
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${className}`}>
      {testimonials.map((testimonial) => (
        <TestimonialCard key={testimonial.id} testimonial={testimonial} />
      ))}
    </div>
  )
}
