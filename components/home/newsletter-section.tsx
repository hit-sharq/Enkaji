"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Successfully subscribed!",
      description:
        "Thank you for joining our newsletter. You'll receive updates about new products and artisan stories.",
    })

    setEmail("")
    setIsLoading(false)
  }

  return (
    <section className="py-16 bg-enkaji-ink text-enkaji-ivory">
      <div className="container mx-auto px-4 text-center">
        <p className="enkaji-eyebrow mb-4">Newsletter</p>
        <h2 className="font-playfair text-3xl md:text-4xl font-semibold mb-4">Stay Connected</h2>
        <p className="text-xl mb-8 text-enkaji-ivory/70 max-w-2xl mx-auto">
          Subscribe to our newsletter for updates on new products, artisan stories, and exclusive offers from the Enkaji
          community.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-enkaji-ivory text-enkaji-ink border-transparent"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold px-6"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
