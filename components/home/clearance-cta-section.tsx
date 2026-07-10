"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store, TrendingDown, Clock, CheckCircle } from "lucide-react"

export function ClearanceCTASection() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Turn Excess Stock Into Cash</h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Have overstock, end-of-season inventory, or slow-moving products? List them as clearance deals and reach thousands of buyers on Enkaji.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                  <Store className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">1. Apply</CardTitle>
                <CardDescription className="text-slate-300">Submit your business details for quick approval</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                  <TrendingDown className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">2. List</CardTitle>
                <CardDescription className="text-slate-300">Create clearance deals with your pricing and terms</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-white">3. Sell</CardTitle>
                <CardDescription className="text-slate-300">Your deals go live after admin review</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/dashboard/clearance/apply">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-lg font-semibold">
                Apply to Sell Clearance Deals
              </Button>
            </Link>
            <p className="text-slate-400 text-sm mt-4">No seller account required • Free to apply • Approval within 24-48 hours</p>
          </div>
        </div>
      </div>
    </section>
  )
}
