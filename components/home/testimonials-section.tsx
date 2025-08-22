"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Testimonial {
  id: string
  name: string
  business: string | null
  content: string
  rating: number
  imageUrl: string | null
  location: string | null
  isVerified: boolean
  isFeatured: boolean
  createdAt: string
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials?featured=true&limit=6")
      const data = await response.json()

      if (response.ok) {
        setTestimonials(data.testimonials || [])
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, testimonials.length))
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % Math.max(1, testimonials.length))
  }

  const displayTestimonials =
    testimonials.length > 0
      ? testimonials
      : [
          {
            id: "placeholder-1",
            name: "Coming Soon",
            business: "Real Customer Testimonials",
            content: "We're collecting genuine feedback from our users. Your testimonial could be featured here!",
            rating: 5,
            imageUrl: null,
            location: null,
            isVerified: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "placeholder-2",
            name: "Share Your Experience",
            business: "Verified Buyers & Sellers",
            content:
              "Have you used Enkaji Trade Kenya? We'd love to hear about your experience and feature your story.",
            rating: 5,
            imageUrl: null,
            location: null,
            isVerified: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: "placeholder-3",
            name: "Join Our Community",
            business: "Growing Network",
            content:
              "Be among the first to experience Kenya's premier B2B marketplace and help us build something amazing.",
            rating: 5,
            imageUrl: null,
            location: null,
            isVerified: true,
            isFeatured: true,
            createdAt: new Date().toISOString(),
          },
        ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Community Says</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {testimonials.length > 0
              ? "Hear from our satisfied customers and partners who have experienced success with Enkaji Trade Kenya."
              : "We're building Kenya's premier B2B marketplace. Join us and be part of the success stories we'll feature here."}
          </p>
        </div>

        <div className="relative">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayTestimonials.slice(0, 6).map((testimonial) => (
              <Card
                key={testimonial.id}
                className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 enkaji-card-hover"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Quote className="w-8 h-8 text-enkaji-ochre mb-2" />
                  </div>

                  <p className="text-gray-700 mb-6 italic line-clamp-3">"{testimonial.content}"</p>

                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-gradient-to-br from-enkaji-gold to-enkaji-ochre flex items-center justify-center">
                      {testimonial.imageUrl ? (
                        <Image
                          src={testimonial.imageUrl || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">
                        {testimonial.business}
                        {testimonial.location && ` • ${testimonial.location}`}
                      </p>
                      {testimonial.isVerified && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600">Verified Customer</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Carousel View */}
          <div className="md:hidden">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {displayTestimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <Card className="bg-white shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Quote className="w-8 h-8 text-enkaji-ochre mb-2" />
                        </div>

                        <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                        <div className="flex items-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                        </div>

                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-full mr-4 overflow-hidden bg-gradient-to-br from-enkaji-gold to-enkaji-ochre flex items-center justify-center">
                            {testimonial.imageUrl ? (
                              <Image
                                src={testimonial.imageUrl || "/placeholder.svg"}
                                alt={testimonial.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                            <p className="text-sm text-gray-600">
                              {testimonial.business}
                              {testimonial.location && ` • ${testimonial.location}`}
                            </p>
                            {testimonial.isVerified && (
                              <div className="flex items-center gap-1 mt-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-xs text-green-600">Verified Customer</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Controls */}
            {displayTestimonials.length > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full bg-transparent">
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex gap-2">
                  {displayTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-enkaji-ochre" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>

                <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full bg-transparent">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <Card className="bg-gradient-to-br from-enkaji-cream to-orange-50 border-enkaji-ochre/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-semibold text-enkaji-red text-xl mb-4">
                Have a Great Experience with Enkaji Trade Kenya?
              </h3>
              <p className="text-enkaji-brown mb-6">
                We'd love to hear your story! Share your experience and help other businesses discover the benefits of
                our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  className="enkaji-button-primary"
                  onClick={() => (window.location.href = "/testimonials/submit")}
                >
                  Share Your Story
                </Button>
                <div className="text-sm text-enkaji-brown">
                  <p>
                    <strong>Email:</strong> testimonials@enkajitradeKenya.com
                  </p>
                  <p>
                    <strong>WhatsApp:</strong> +254 700 000 000
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
