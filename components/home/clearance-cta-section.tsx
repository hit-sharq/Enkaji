"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, TrendingDown, Clock, CheckCircle } from "lucide-react"

export function ClearanceCTASection() {
  return (
    <section className="bg-enkaji-orange py-20 text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-12 text-center">
          <p className="enkaji-eyebrow mb-4 !text-enkaji-orange">Clearance Program</p>
          <h2 className="mb-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            Turn Excess Stock Into Cash
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/80">
            Have overstock, end-of-season inventory, or slow-moving products? List them as clearance deals and reach thousands of buyers on Enkaji.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Store className="h-6 w-6 text-enkaji-orange" />
              </div>
              <CardTitle className="text-white">1. Apply</CardTitle>
              <CardDescription className="text-white/70">Submit your business details for quick approval</CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <TrendingDown className="h-6 w-6 text-enkaji-orange" />
              </div>
              <CardTitle className="text-white">2. List</CardTitle>
              <CardDescription className="text-white/70">Create clearance deals with your pricing and terms</CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-sm">
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <CheckCircle className="h-6 w-6 text-enkaji-orange" />
              </div>
              <CardTitle className="text-white">3. Sell</CardTitle>
              <CardDescription className="text-white/70">Your deals go live after admin review</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/dashboard/clearance/apply">
            <Button size="lg" className="rounded-xl bg-enkaji-orange px-8 py-3 text-lg font-semibold text-enkaji-ink hover:bg-enkaji-orange/90">
              Apply to Sell Clearance Deals
            </Button>
          </Link>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-white/70">
            <Clock className="h-4 w-4" />
            No seller account required • Free to apply • Approval within 24-48 hours
          </p>
        </div>
      </div>
    </section>
  )
}
