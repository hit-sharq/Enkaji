"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar, Clock, DollarSign, Users, Star,
  CheckCircle, XCircle, MessageCircle, Phone, Mail,
  Plus, Settings, BarChart3, Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Booking {
  id: string
  serviceName: string
  customerName: string
  customerPhone: string
  customerEmail: string
  date: string
  timeSlot: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  price: string
}

interface Service {
  id: string
  name: string
  price: string
  duration: number
  totalBookings: number
}

interface Stats {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: string
  averageRating: number
  totalReviews: number
}

export default function ServiceProviderDashboard() {
  const { toast } = useToast()
  const [stats, setStats] = useState<Stats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [bookingsRes, servicesRes] = await Promise.all([
        fetch("/api/services/bookings"),
        fetch("/api/services"),
      ])

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setBookings(bookingsData.bookings || [])

        // Calculate stats from bookings
        const allBookings = bookingsData.bookings || []
        const completed = allBookings.filter((b: any) => b.status === "COMPLETED")
        const pending = allBookings.filter((b: any) => b.status === "PENDING")

        // Sum earnings from completed bookings
        const totalEarnings = completed.reduce((sum: number, b: any) => sum + Number(b.price), 0)

        setStats({
          totalBookings: allBookings.length,
          pendingBookings: pending.length,
          completedBookings: completed.length,
          totalEarnings: totalEarnings.toString(),
          averageRating: 0, // Will be filled from services API or separate endpoint
          totalReviews: 0,
        })
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        const services = servicesData.services || []
        setServices(services.map((s: any) => ({
          id: s.id,
          name: s.name,
          price: s.price.toString(),
          duration: s.duration,
          totalBookings: s.totalReviews || 0, // Using reviews as proxy, ideally would have separate bookings count
        })))
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      const res = await fetch("/api/services/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action: "confirm" }),
      })

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
        toast({ title: "Booking Confirmed", description: "The customer has been notified." })
        // Update stats
        setStats(prev => prev ? { ...prev, pendingBookings: prev.pendingBookings - 1 } : null)
      } else {
        throw new Error("Failed to confirm")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to confirm booking", variant: "destructive" })
    }
  }

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      const res = await fetch("/api/services/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action: "complete" }),
      })

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "COMPLETED" } : b))
        toast({ title: "Booking Completed", description: "Service marked as completed." })
        // Recalculate stats
        fetchDashboardData()
      } else {
        throw new Error("Failed to complete")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to complete booking", variant: "destructive" })
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch("/api/services/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, action: "cancel", reason: "Cancelled by provider" }),
      })

      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
        toast({ title: "Booking Cancelled", description: "The customer has been notified." })
        fetchDashboardData()
      } else {
        throw new Error("Failed to cancel")
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel booking", variant: "destructive" })
    }
  }

  const pendingBookings = bookings.filter(b => b.status === "PENDING")
  const todayBookings = bookings.filter(b => b.date === new Date().toISOString().split("T")[0])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case "CONFIRMED":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>
      case "COMPLETED":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>
      case "CANCELLED":
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}><CardContent className="p-6"><div className="h-8 bg-gray-200 rounded"></div></CardContent></Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Service Dashboard</h1>
            <p className="text-gray-600">Manage your bookings and services</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard/services/settings"}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button className="bg-[#8B2635] hover:bg-[#7a1f2e]" onClick={() => window.location.href = "/dashboard/services/new"}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-gray-500">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                <p className="text-xs text-gray-500">Awaiting confirmation</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {Number(stats.totalEarnings).toLocaleString()}</div>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-500">{stats.totalReviews} reviews</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Search bookings..." className="max-w-xs" />
            </div>

            {pendingBookings.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-800">Pending Bookings ({pendingBookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium">{booking.serviceName}</p>
                          <p className="text-sm text-gray-500">{booking.customerName} • {booking.customerPhone}</p>
                          <p className="text-sm">{booking.date} at {booking.timeSlot}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleConfirmBooking(booking.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirm
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleCancelBooking(booking.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{booking.serviceName}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <p className="text-sm text-gray-600">{booking.customerName}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {booking.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {booking.timeSlot}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">KSh {Number(booking.price).toLocaleString()}</p>
                          {booking.status === "CONFIRMED" && (
                            <Button size="sm" className="mt-2" onClick={() => handleCompleteBooking(booking.id)}>
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">My Services</h2>
              <Button className="bg-[#8B2635]" onClick={() => window.location.href = "/dashboard/services/new"}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-gray-600 text-sm">{service.duration} minutes</p>
                        <p className="text-sm text-gray-500">{service.totalBookings} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[#8B2635]">KSh {Number(service.price).toLocaleString()}</p>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/services/${service.id}/edit`}>Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...new Set(bookings.map(b => b.customerPhone))].slice(0, 5).map((phone) => {
                    const customer = bookings.find(b => b.customerPhone === phone)
                    return (
                      <div key={phone} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{customer?.customerName}</p>
                          <p className="text-sm text-gray-500">{phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
