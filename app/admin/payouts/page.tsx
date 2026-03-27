"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Wallet, CheckCircle, Loader2, CreditCard } from "lucide-react"
import { format } from "date-fns"

interface Earning {
  id: string
  amount: number
  commission: number
  netAmount: number
  status: string
  payoutDate: string | null
  createdAt: string
  driver: { fullName: string; phoneNumber: string; bankAccountName: string | null; bankAccountNumber: string | null; bankCode: string | null }
  delivery: { deliveryNumber: string; deliveredAt: string | null }
}

interface Summary { status: string; _sum: { netAmount: number }; _count: number }

export default function PayoutsAdminPage() {
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [summary, setSummary] = useState<Summary[]>([])
  const [status, setStatus] = useState("pending")
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)

  useEffect(() => { fetchEarnings() }, [status])

  const fetchEarnings = async () => {
    setLoading(true)
    setSelected([])
    const res = await fetch(`/api/lumyn/admin/payouts?status=${status}`)
    const data = await res.json()
    setEarnings(data.earnings || [])
    setSummary(data.summary || [])
    setLoading(false)
  }

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const toggleAll = () => setSelected(selected.length === earnings.length ? [] : earnings.map(e => e.id))

  const markPaid = async () => {
    if (!selected.length) return
    setProcessing(true)
    await fetch("/api/lumyn/admin/payouts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ earningIds: selected, action: "mark_paid" }),
    })
    setProcessing(false)
    fetchEarnings()
  }

  const totalPending = summary.find(s => s.status === "pending")?._sum?.netAmount || 0
  const totalPaid = summary.find(s => s.status === "paid")?._sum?.netAmount || 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6" /> Driver Payouts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage Lumyn driver earnings and payouts</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 mb-1">Pending Payouts</p>
            <p className="text-2xl font-bold text-amber-600">KES {totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">KES {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {selected.length > 0 && status === "pending" && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
          <p className="text-sm font-medium">{selected.length} earning{selected.length > 1 ? "s" : ""} selected</p>
          <Button onClick={markPaid} disabled={processing} size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1">
            {processing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            Mark as Paid
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : earnings.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-gray-400">No {status} payouts.</CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {status === "pending" && (
                    <th className="p-3 w-10">
                      <Checkbox checked={selected.length === earnings.length} onCheckedChange={toggleAll} />
                    </th>
                  )}
                  <th className="p-3 text-left font-medium text-gray-600">Driver</th>
                  <th className="p-3 text-left font-medium text-gray-600">Delivery</th>
                  <th className="p-3 text-left font-medium text-gray-600">Amount</th>
                  <th className="p-3 text-left font-medium text-gray-600">Bank</th>
                  <th className="p-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {earnings.map(e => (
                  <tr key={e.id} className={`hover:bg-gray-50 ${selected.includes(e.id) ? "bg-amber-50" : ""}`}>
                    {status === "pending" && (
                      <td className="p-3">
                        <Checkbox checked={selected.includes(e.id)} onCheckedChange={() => toggleSelect(e.id)} />
                      </td>
                    )}
                    <td className="p-3">
                      <p className="font-medium">{e.driver.fullName}</p>
                      <p className="text-gray-400 text-xs">{e.driver.phoneNumber}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-mono text-xs">{e.delivery.deliveryNumber}</p>
                      <p className="text-gray-400 text-xs">
                        {e.delivery.deliveredAt ? format(new Date(e.delivery.deliveredAt), "MMM d, yyyy") : "—"}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-bold">KES {e.netAmount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Gross: {e.amount.toLocaleString()}</p>
                    </td>
                    <td className="p-3">
                      {e.driver.bankAccountNumber ? (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <CreditCard className="h-3 w-3" />
                          <span>{e.driver.bankAccountNumber.slice(-4).padStart(e.driver.bankAccountNumber.length, "*")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <Badge className={e.status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {e.status}
                      </Badge>
                      {e.payoutDate && (
                        <p className="text-xs text-gray-400 mt-1">{format(new Date(e.payoutDate), "MMM d")}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
