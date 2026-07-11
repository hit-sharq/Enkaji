"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star, MapPin, Clock, Phone, Mail, CheckCircle,
  ChevronLeft, ChevronRight, Calendar, ArrowLeft,
  Share2, Heart, Shield, MessageCircle, Loader2
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface WorkingHour {
  day: string
  open: string | null
  close: string | null
  isOpen: boolean
}

interface ServiceReview {
  id: string
  rating: number
  title: string | null
  comment: string | null
  date: string
  customerName: string
}

interface ServiceProvider {
  id: string
  businessName: string
  slug: string
  logo: string | null
  description: string
  phone: string
  whatsapp: string
  email: string
  yearsExperience: number
  isVerified: boolean
  averageRating: number
  totalReviews: number
  isPremium: boolean
}

interface Service {
  id: string
  name: string
  description: string
  category: string
  price: number
  duration: number
  images: string[]
  location: string
  county: string
  address: string
  provider: ServiceProvider
  reviews: ServiceReview[]
  workingHours: WorkingHour[]
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
]

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  })

  // Review state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`/api/services/${resolvedParams.id}`)
        if (res.ok) {
          const data = await res.json()
          setService(data.service)
        }
      } catch (error) {
        console.error("Error fetching service:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [resolvedParams.id])

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Select Date & Time",
        description: "Please select both a date and time for your booking",
        variant: "destructive",
      })
      return
    }
    if (!bookingData.name || !bookingData.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and phone number",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/services/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service?.id,
          date: selectedDate.toISOString(),
          timeSlot: selectedTime,
          customerName: bookingData.name,
          customerPhone: bookingData.phone,
          customerEmail: bookingData.email,
          notes: bookingData.notes,
        }),
      })

      if (res.ok) {
        toast({
          title: "Booking Submitted!",
          description: `Your appointment on ${selectedDate.toLocaleDateString()} at ${selectedTime} has been requested.`,
        })
        setBookingStep(3)
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to book")
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewComment.trim()) {
      toast({
        title: "Required",
        description: "Please provide a review comment",
        variant: "destructive",
      })
      return
    }

    setReviewSubmitting(true)
    try {
      const res = await fetch("/api/services/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service?.id,
          rating: reviewRating,
          title: reviewTitle || null,
          comment: reviewComment,
          images: [],
        }),
      })

      if (res.ok) {
        toast({
          title: "Review Submitted!",
          description: "Thank you for your feedback.",
        })
        setReviewOpen(false)
        setReviewRating(5)
        setReviewTitle("")
        setReviewComment("")
        // Refresh service data
        fetchService()
      } else {
        const data = await res.json()
        throw new Error(data.error || "Failed to submit review")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setReviewSubmitting(false)
    }
  }

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${resolvedParams.id}`)
      if (res.ok) {
        const data = await res.json()
        setService(data.service)
      }
    } catch (error) {
      console.error("Error fetching service:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-96 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-2 text-foreground">Service Not Found</h2>
          <p className="text-muted-foreground mb-4">The service you're looking for doesn't exist.</p>
          <Link href="/services">
            <Button>Browse Services</Button>
          </Link>
        </div>
      </div>
    )
  }

  // WriteReviewButton Component
  const WriteReviewButton = () => (
    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
      <Button variant="outline" size="sm" onClick={() => setReviewOpen(true)} className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
        Write a Review
      </Button>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-foreground">Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this service
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="mb-2 block text-foreground">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= reviewRating
                        ? "fill-enkaji-gold text-enkaji-gold"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-title" className="text-foreground">Title (optional)</Label>
            <Input
              id="review-title"
              placeholder="Summarize your experience"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="review-comment" className="text-foreground">Review *</Label>
            <Textarea
              id="review-comment"
              placeholder="Tell others about your experience..."
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setReviewOpen(false)} className="border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitReview}
            disabled={reviewSubmitting}
            className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold"
          >
            {reviewSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/services" className="flex items-center gap-2 text-muted-foreground hover:text-enkaji-gold mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="border border-border bg-card rounded-xl">
              <div className="relative aspect-video bg-muted rounded-t-lg">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <Clock className="h-16 w-16" />
                </div>
                {service.provider.isPremium && (
                  <Badge className="absolute top-4 left-4 bg-enkaji-gold text-enkaji-ink">
                    Premium Provider
                  </Badge>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={() => setCurrentImageIndex(Math.min(service.images.length - 1, currentImageIndex + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Service Info */}
            <Card className="border border-border bg-card rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge className="bg-enkaji-gold text-enkaji-ink mb-2">{service.category}</Badge>
                    <h1 className="text-2xl font-display font-semibold text-foreground">{service.name}</h1>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-enkaji-gold text-enkaji-gold" />
                    <span className="font-semibold">{service.provider.averageRating}</span>
                    <span className="text-muted-foreground">({service.provider.totalReviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {service.location}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration} minutes
                  </div>
                </div>

                <div className="border-t border-border pt-6">
                  <h2 className="font-medium mb-3 text-foreground">About This Service</h2>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>

                {/* Provider Card */}
                <div className="border-t border-border pt-6 mt-6">
                  <h2 className="font-medium mb-3 text-foreground">About the Provider</h2>
                  <Card className="bg-muted border border-border rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={service.provider.logo || ""} />
                          <AvatarFallback className="bg-enkaji-red text-white text-xl">
                            {service.provider.businessName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{service.provider.businessName}</h3>
                            {service.provider.isVerified && (
                              <CheckCircle className="h-4 w-4 text-enkaji-green" />
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{service.provider.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{service.provider.yearsExperience} years experience</span>
                            <span>{service.provider.totalReviews} reviews</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageCircle className="h-4 w-4" />
                          Message
                        </Button>
                        <Link href={`/services/providers/${service.provider.slug}`}>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Working Hours */}
                <div className="border-t border-border pt-6 mt-6">
                  <h2 className="font-medium mb-3 text-foreground">Working Hours</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {service.workingHours.map((hours) => (
                      <div key={hours.day} className="flex justify-between text-sm">
                        <span className={hours.isOpen ? "text-foreground" : "text-muted-foreground"}>{hours.day}</span>
                        <span className={hours.isOpen ? "text-foreground" : "text-muted-foreground"}>
                          {hours.isOpen ? `${hours.open} - ${hours.close}` : "Closed"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews */}
                <div className="border-t border-border pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-foreground">Reviews</h2>
                    <WriteReviewButton />
                  </div>
                  {service.reviews.length === 0 ? (
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  ) : (
                    <div className="space-y-4">
                      {service.reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "fill-enkaji-gold text-enkaji-gold" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                            {review.title && <span className="font-medium text-foreground">{review.title}</span>}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{review.comment}</p>
                          <p className="text-muted-foreground text-xs">{review.customerName} • {review.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Booking */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-8 border border-border bg-card rounded-xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Book This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bookingStep === 1 && (
                  <>
                    {/* Date Selection */}
                    <div>
                      <Label className="mb-2 block text-foreground">Select Date</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {dates.slice(0, 8).map((date) => (
                          <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={`p-2 text-center rounded-lg border border-border ${
                              selectedDate?.toDateString() === date.toDateString()
                                ? "bg-enkaji-gold text-enkaji-ink border-enkaji-gold"
                                : "hover:border-enkaji-gold bg-card"
                            }`}
                          >
                            <div className="text-xs text-muted-foreground">{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                            <div className="font-semibold text-foreground">{date.getDate()}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                      <div>
                        <Label className="mb-2 block text-foreground">Select Time</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              className={selectedTime === time ? "bg-enkaji-gold text-enkaji-ink font-semibold hover:bg-enkaji-gold/90" : "border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10"}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold"
                      onClick={() => selectedDate && selectedTime && setBookingStep(2)}
                      disabled={!selectedDate || !selectedTime}
                    >
                      Continue
                    </Button>
                  </>
                )}

                {bookingStep === 2 && (
                  <>
                    <div className="p-3 bg-muted rounded-lg border border-border">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{selectedDate?.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-foreground">Full Name *</Label>
                        <Input
                          placeholder="Your name"
                          value={bookingData.name}
                          onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Phone Number *</Label>
                        <Input
                          placeholder="07XX XXX XXX"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Email (Optional)</Label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={bookingData.email}
                          onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label className="text-foreground">Notes (Optional)</Label>
                        <Textarea
                          placeholder="Any special requests..."
                          value={bookingData.notes}
                          onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setBookingStep(1)} className="flex-1 border-enkaji-gold/50 text-enkaji-gold hover:bg-enkaji-gold/10">
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold"
                        onClick={handleBooking}
                        disabled={submitting}
                      >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm Booking
                      </Button>
                    </div>
                  </>
                )}

                {bookingStep === 3 && (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                      <CheckCircle className="h-8 w-8 text-enkaji-green" />
                    </div>
                    <h3 className="font-medium text-lg mb-2 text-foreground">Booking Submitted!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      The provider will confirm your appointment shortly. You'll receive an SMS confirmation.
                    </p>
                    <Button className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold" onClick={() => { setBookingStep(1); setSelectedDate(null); setSelectedTime(null) }}>
                      Book Another
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card className="border border-border bg-card rounded-xl shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-enkaji-gold" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Secure Booking</p>
                    <p className="text-xs text-muted-foreground">Protected by Enkaji</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-enkaji-green" />
                  <div>
                    <p className="font-medium text-sm text-foreground">Verified Provider</p>
                    <p className="text-xs text-muted-foreground">Identity & documents checked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
