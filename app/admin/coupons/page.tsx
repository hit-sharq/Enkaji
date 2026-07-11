"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Tag, ToggleLeft, ToggleRight, Loader2 } from "lucide-react"
import { format } from "date-fns"

interface Coupon {
  id: string
  code: string
  description: string | null
  discountType: string
  discountValue: number
  minimumOrder: number
  maximumDiscount: number | null
  usageLimit: number | null
  usageCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: "", description: "", discountType: "percentage",
    discountValue: "", minimumOrder: "", maximumDiscount: "",
    usageLimit: "", expiresAt: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchCoupons() }, [])

  const fetchCoupons = async () => {
    setLoading(true)
    const res = await fetch("/api/coupons")
    const data = await res.json()
    setCoupons(data.coupons || [])
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) {
      setError("Code and discount value are required")
      return
    }
    setSaving(true)
    setError("")
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || "Failed to create coupon")
    } else {
      setOpen(false)
      setForm({ code: "", description: "", discountType: "percentage", discountValue: "", minimumOrder: "", maximumDiscount: "", usageLimit: "", expiresAt: "" })
      fetchCoupons()
    }
    setSaving(false)
  }

  const toggleCoupon = async (id: string, current: boolean) => {
    await fetch("/api/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    })
    fetchCoupons()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2 text-foreground"><Tag className="h-6 w-6 text-enkaji-gold" /> Coupon Codes</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage promo codes for buyers</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold gap-2">
              <Plus className="h-4 w-4" /> New Coupon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Coupon Code</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Code *</Label>
                <Input placeholder="SAVE20" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="uppercase tracking-widest" />
              </div>
              <div>
                <Label>Description</Label>
                <Input placeholder="20% off for new customers" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Discount Type</Label>
                  <Select value={form.discountType} onValueChange={v => setForm(f => ({ ...f, discountType: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (KES)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value *</Label>
                  <Input type="number" placeholder={form.discountType === "percentage" ? "20" : "500"} value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min. Order (KES)</Label>
                  <Input type="number" placeholder="1000" value={form.minimumOrder} onChange={e => setForm(f => ({ ...f, minimumOrder: e.target.value }))} />
                </div>
                <div>
                  <Label>Max Discount (KES)</Label>
                  <Input type="number" placeholder="2000" value={form.maximumDiscount} onChange={e => setForm(f => ({ ...f, maximumDiscount: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Usage Limit</Label>
                  <Input type="number" placeholder="100" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))} />
                </div>
                <div>
                  <Label>Expires At</Label>
                  <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleCreate} disabled={saving} className="w-full bg-enkaji-gold hover:bg-enkaji-gold/90 text-enkaji-ink font-semibold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Create Coupon
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : coupons.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No coupons yet. Create your first promo code.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {coupons.map(c => (
            <Card key={c.id} className={!c.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-enkaji-brown border border-enkaji-ochre rounded-lg px-3 py-2 font-mono font-bold text-enkaji-brown tracking-widest text-sm">
                    {c.code}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {c.discountType === "percentage" ? `${c.discountValue}% off` : `KES ${c.discountValue} off`}
                      {c.maximumDiscount ? ` (max KES ${c.maximumDiscount.toLocaleString()})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.description || "—"}
                      {c.minimumOrder ? ` · Min. KES ${c.minimumOrder.toLocaleString()}` : ""}
                      {c.expiresAt ? ` · Expires ${format(new Date(c.expiresAt), "MMM d, yyyy")}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold">{c.usageCount}</p>
                    <p className="text-xs text-muted-foreground">{c.usageLimit ? `/ ${c.usageLimit}` : "uses"}</p>
                  </div>
                  <Badge variant={c.isActive ? "default" : "secondary"} className={c.isActive ? "bg-enkaji-green text-enkaji-green border-enkaji-green" : ""}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                    <button onClick={() => toggleCoupon(c.id, c.isActive)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {c.isActive ? <ToggleRight className="h-5 w-5 text-enkaji-green" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
