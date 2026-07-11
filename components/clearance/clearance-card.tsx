"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles } from "lucide-react"

interface ClearanceProduct {
  id: string
  name: string
  description?: string
  price: number
  comparePrice?: number | null
  inventory: number
  images: string[]
  category?: { name: string } | string | null
  clearanceEndDate?: string | null
  clearanceReason?: string | null
  clearanceViews?: number
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ended"
  const seconds = Math.floor(ms / 1000)
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
    .toString()
    .padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
}

export function ClearanceCard({ product }: { product: ClearanceProduct }) {
  const [countdown, setCountdown] = useState("Loading...")

  useEffect(() => {
    if (!product.clearanceEndDate) {
      setCountdown("N/A")
      return
    }

    const target = new Date(product.clearanceEndDate).getTime()
    const tick = () => {
      const remaining = target - Date.now()
      setCountdown(formatCountdown(remaining))
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [product.clearanceEndDate])

  const discount = useMemo(() => {
    if (!product.comparePrice || product.comparePrice <= product.price) return 0
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
  }, [product.comparePrice, product.price])

  const categoryName = typeof product.category === "string" ? product.category : product.category?.name
  const reason = product.clearanceReason || "Clearance Deal"
  const stockLabel = product.inventory <= 5 ? "Limited Stock" : "Warehouse Clearance"

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      className="min-w-[320px] max-w-[320px] overflow-hidden rounded-[32px] border border-card/10 bg-card/10 shadow-2xl shadow-enkaji-ink/10 backdrop-blur-xl"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 100vw, 320px"
        />
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-4">
          <Badge className="bg-enkaji-ochre text-white">{reason}</Badge>
          <Badge className="bg-enkaji-forest text-white">{discount}% OFF</Badge>
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs uppercase tracking-[0.15em] text-white shadow-lg shadow-black/20">
          {stockLabel}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-enkaji-ochre">{categoryName || "Buy Now"}</p>
            <h3 className="text-xl font-semibold text-enkaji-ink mt-1">{product.name}</h3>
          </div>
          <div className="rounded-3xl bg-enkaji-ink/95 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-lg shadow-enkaji-ink/20">
            {product.inventory} left
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-3 text-enkaji-ink">
            <span className="text-sm line-through">KES {product.comparePrice?.toLocaleString() ?? "-"}</span>
            <span className="text-2xl font-bold text-enkaji-ink">KES {product.price.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">Save KES {(product.comparePrice ? product.comparePrice - product.price : 0).toLocaleString()}</p>
        </div>

        <div className="grid gap-2 rounded-3xl bg-card/70 p-4 text-enkaji-ink shadow-inner shadow-enkaji-ink/5">
          <div className="flex items-center gap-2 text-sm font-medium text-enkaji-ink">
            <Clock className="h-4 w-4" />
            <span>Ends in {countdown}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>{product.clearanceViews ?? 0} views</span>
          </div>
        </div>

        <Link href={`/products/${product.id}`} className="block">
          <Button className="w-full bg-enkaji-ink text-white hover:bg-enkaji-forest">
            View Deal
          </Button>
        </Link>
      </div>
    </motion.article>
  )
}
