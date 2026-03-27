"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tag, X, Loader2, CheckCircle } from "lucide-react"

interface PromoCodeProps {
  orderTotal: number
  onDiscount: (code: string, amount: number) => void
  onRemove: () => void
  appliedCode?: string
  discountAmount?: number
}

export function PromoCode({ orderTotal, onDiscount, onRemove, appliedCode, discountAmount }: PromoCodeProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleApply = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), orderTotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid coupon")
      } else {
        onDiscount(data.coupon.code, data.discountAmount)
        setCode("")
      }
    } catch {
      setError("Failed to validate coupon")
    } finally {
      setLoading(false)
    }
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            <Badge variant="outline" className="mr-1 text-green-700 border-green-400">{appliedCode}</Badge>
            − KES {discountAmount?.toLocaleString()}
          </span>
        </div>
        <button onClick={onRemove} className="text-green-600 hover:text-red-500 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Promo code"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError("") }}
            className="pl-9 uppercase tracking-widest"
            onKeyDown={e => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button variant="outline" onClick={handleApply} disabled={!code.trim() || loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
