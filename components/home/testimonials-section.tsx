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
    <section className="bg-muted py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="enkaji-eyebrow mb-4">Testimonials</p>
          <h2 className="mb-4 font-display text-3xl font-semibold text-foreground md:text-4xl">
            What Our Community Says
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {testimonials.length > 0
              ? "Hear from our satisfied customers and partners who have experienced success with Enkaji Trade Kenya."
              : "We're building Kenya's premier B2B marketplace. Join us and be part of the success stories we'll feature here."}
          </p>
        </div>

        <div className="relative">
          {/* Desktop Grid View */}
          <div className="hidden md:grid md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-8">
            {displayTestimonials.slice(0, 6).map((testimonial) => (
              <Card
                key={testimonial.id}
                className="enkaji-card-hover rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-card-hover"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <Quote className="mb-2 h-8 w-8 text-enkaji-orange" />
                  </div>

                  <p className="mb-6 line-clamp-3 italic text-foreground/80">&quot;{testimonial.content}&quot;</p>

                  <div className="mb-4 flex items-center">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-enkaji-orange" />
                    ))}
                  </div>

                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-enkaji-orange to-enkaji-orange">
                      {testimonial.imageUrl ? (
                        <Image
                          src={testimonial.imageUrl || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold text-enkaji-ivory">{testimonial.name?.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.business}
                        {testimonial.location && ` • ${testimonial.location}`}
                      </p>
                      {testimonial.isVerified && (
                        <div className="mt-1 flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-enkaji-orange"></div>
                          <span className="text-xs text-enkaji-orange">Verified Customer</span>
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
                    <Card className="rounded-2xl border border-border bg-card shadow-card">
                      <CardContent className="p-6">
                        <div className="mb-4 flex items-center">
                          <Quote className="mb-2 h-8 w-8 text-enkaji-orange" />
                        </div>

                        <p className="mb-6 italic text-foreground/80">&quot;{testimonial.content}&quot;</p>

                        <div className="mb-4 flex items-center">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current text-enkaji-orange" />
                          ))}
                        </div>

                        <div className="flex items-center">
                          <div className="mr-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-enkaji-orange to-enkaji-orange">
                            {testimonial.imageUrl ? (
                              <Image
                                src={testimonial.imageUrl || "/placeholder.svg"}
                                alt={testimonial.name}
                                width={48}
                                height={48}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-enkaji-ivory">{testimonial.name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.business}
                              {testimonial.location && ` • ${testimonial.location}`}
                            </p>
                            {testimonial.isVerified && (
                              <div className="mt-1 flex items-center gap-1">
                                <div className="h-3 w-3 rounded-full bg-enkaji-orange"></div>
                                <span className="text-xs text-enkaji-orange">Verified Customer</span>
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
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevTestimonial}
                  className="rounded-full border-enkaji-orange/50 bg-transparent text-enkaji-orange"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-2">
                  {displayTestimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-3 w-3 rounded-full transition-colors ${
                        index === currentIndex ? "bg-enkaji-orange" : "bg-enkaji-orange/30"
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextTestimonial}
                  className="rounded-full border-enkaji-orange/50 bg-transparent text-enkaji-orange"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-2xl rounded-2xl border border-border bg-card">
            <CardContent className="p-8">
              <h3 className="mb-4 text-xl font-semibold text-enkaji-ink">
                Have a Great Experience with Enkaji Trade Kenya?
              </h3>
              <p className="mb-6 text-muted-foreground">
                We'd love to hear your story! Share your experience and help other businesses discover the benefits of
                our platform.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  className="enkaji-button-primary"
                  onClick={() => (window.location.href = "/testimonials/submit")}
                >
                  Share Your Story
                </Button>
                <div className="text-sm text-muted-foreground">
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
