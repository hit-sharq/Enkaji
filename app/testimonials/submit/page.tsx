"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function SubmitTestimonialPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          name: "",
          email: "",
          message: "",
          rating: 5
        })
      } else {
        setSubmitStatus("error")
        setErrorMessage(data.error || "Failed to submit testimonial")
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-enkaji-cream py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <p className="enkaji-eyebrow mb-3">Community</p>
            <h1 className="font-playfair font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Share Your Success Story
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Help other businesses discover the benefits of trading through Enkaji Trade Kenya 
              by sharing your experience. Your story could inspire others to join our community.
            </p>
            <Link href="/testimonials" className="text-enkaji-gold hover:text-enkaji-gold/80 transition-colors">
              ← Back to Testimonials
            </Link>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="border border-border bg-card rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <MessageSquare className="w-6 h-6 text-enkaji-gold" />
                    Submit Your Testimonial
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {submitStatus === "success" && (
                    <div className="bg-enkaji-gold/10 border border-enkaji-gold/30 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-enkaji-gold" />
                      <div>
                        <p className="text-enkaji-gold font-medium">Thank you for your testimonial!</p>
                        <p className="text-enkaji-gold/80 text-sm">
                          We've received your feedback and will review it shortly.
                        </p>
                      </div>
                    </div>
                  )}

                  {submitStatus === "error" && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="text-destructive font-medium">Submission Failed</p>
                        <p className="text-destructive/80 text-sm">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Overall Rating *</Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className={`p-1 rounded transition-colors ${
                              star <= formData.rating
                                ? "text-enkaji-gold hover:text-enkaji-gold/80"
                                : "text-muted-foreground/40 hover:text-muted-foreground/60"
                            }`}
                          >
                            <Star className="w-8 h-8 fill-current" />
                          </button>
                        ))}
                        <span className="ml-3 text-sm text-muted-foreground self-center">
                          {formData.rating} out of 5 stars
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Your Testimonial *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Share your experience with Enkaji Trade Kenya. What did you like? How has it helped your business? What would you tell other businesses considering our platform?"
                        rows={6}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Minimum 10 characters. Be authentic and specific about your experience.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="enkaji-button-primary w-full"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-enkaji-ink border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Testimonial
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="text-xs text-muted-foreground border-t border-border pt-4">
                    <p>
                      By submitting this testimonial, you agree to have your feedback shared publicly 
                      on our website. We reserve the right to moderate content for appropriateness and accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border border-border bg-card rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">What Makes a Great Testimonial?</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-enkaji-gold rounded-full mt-2 flex-shrink-0" />
                      <span>Be specific about your experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-enkaji-gold rounded-full mt-2 flex-shrink-0" />
                      <span>Mention how our platform helped your business</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-enkaji-gold rounded-full mt-2 flex-shrink-0" />
                      <span>Share specific results or benefits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-enkaji-gold rounded-full mt-2 flex-shrink-0" />
                      <span>Keep it authentic and honest</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card rounded-xl shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-foreground mb-4">Other Ways to Reach Us</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">testimonials@enkajitradeKenya.com</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">WhatsApp</p>
                      <p className="text-sm text-muted-foreground">+254 700 000 000</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">+254 700 000 000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card rounded-xl shadow-sm bg-enkaji-cream">
                <CardContent className="p-6">
                  <h3 className="font-display font-semibold text-enkaji-gold mb-2">Thank You!</h3>
                  <p className="text-sm text-enkaji-ink/70">
                    Your feedback helps us improve our platform and helps other businesses 
                    discover the benefits of trading through Enkaji Trade Kenya.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
