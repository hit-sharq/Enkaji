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

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        toast({
          title: "Successfully subscribed!",
          description:
            "Thank you for joining our newsletter. You'll receive updates about new products and artisan stories.",
        })
        setEmail("")
      } else {
        const data = await response.json()
        toast({
          title: "Subscription failed",
          description: data.error || "Please try again later.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-enkaji-charcoal py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
        <p className="enkaji-eyebrow mb-4 !text-enkaji-orange">Newsletter</p>
        <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
          Stay Connected
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-white/70">
          Subscribe to our newsletter for updates on new products, artisan stories, and exclusive offers from the Enkaji
          community.
        </p>

        <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 rounded-xl border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:border-enkaji-orange"
          />
          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-xl bg-enkaji-orange px-6 font-semibold text-enkaji-ink hover:bg-enkaji-orange/90"
          >
            {isLoading ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </section>
  )
}
