'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Truck,
  Users,
  PackageCheck,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

function formatKES(amount: number) {
  return `KES ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

export default function LumynAdminPage() {
  const [stats, setStats] = useState<any>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [driverFilter, setDriverFilter] = useState('all')
  const [deliveryFilter, setDeliveryFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [statsRes, driversRes, deliveriesRes] = await Promise.all([
        fetch('/api/lumyn/admin/stats'),
        fetch(`/api/lumyn/admin/drivers?kyc=${driverFilter}`),
        fetch(`/api/lumyn/admin/deliveries?status=${deliveryFilter}`),
      ])
      const [statsData, driversData, deliveriesData] = await Promise.all([
        statsRes.json(),
        driversRes.json(),
        deliveriesRes.json(),
      ])
      if (statsData.success) setStats(statsData.data)
      if (driversData.success) setDrivers(driversData.data)
      if (deliveriesData.success) setDeliveries(deliveriesData.data)
    } catch (e) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [driverFilter, deliveryFilter])

  const handleDriverAction = async (driverId: string, action: string) => {
    setActionLoading(driverId + action)
    try {
      const res = await fetch(`/api/lumyn/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Driver ${action === 'approve' ? 'approved' : action === 'suspend' ? 'suspended' : 'reactivated'} successfully`)
        fetchAll()
      } else {
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('Failed to perform action')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lumyn Flow Admin</h1>
            <p className="text-sm text-gray-500 mt-0.5">Delivery management dashboard</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Deliveries</p>
                    <p className="text-xl font-bold">{stats.deliveries.total}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-xs text-gray-500">
                  <span className="text-yellow-600 font-medium">{stats.deliveries.active} active</span>
                  <span className="text-green-600 font-medium">{stats.deliveries.completed} done</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                    <p className="text-xl font-bold">{formatKES(stats.revenue.total)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-xs text-gray-500">
                  <span>Today: {formatKES(stats.revenue.today)}</span>
                  <span>Month: {formatKES(stats.revenue.month)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Drivers</p>
                    <p className="text-xl font-bold">{stats.drivers.total}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-3 text-xs">
                  <span className="text-green-600 font-medium">{stats.drivers.active} active</span>
                  <span className="text-yellow-600 font-medium">{stats.drivers.pendingKyc} pending KYC</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <PackageCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Completion Rate</p>
                    <p className="text-xl font-bold">{stats.deliveries.completionRate}%</p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {stats.deliveries.cancelled} cancelled deliveries
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="drivers">
          <TabsList>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          </TabsList>

          <TabsContent value="drivers" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Driver Management</CardTitle>
                  <Select value={driverFilter} onValueChange={setDriverFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drivers</SelectItem>
                      <SelectItem value="pending">Pending KYC</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : drivers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No drivers found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>KYC</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Deliveries</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{driver.fullName}</p>
                              <p className="text-xs text-gray-500">{driver.phoneNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize text-sm">{driver.vehicleType}</TableCell>
                          <TableCell>
                            {driver.kycVerified ? (
                              <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                <CheckCircle className="h-3.5 w-3.5" /> Verified
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
                                <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                driver.status === 'active'
                                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                  : driver.status === 'suspended'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                              }
                            >
                              {driver.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{driver._count?.deliveries ?? 0}</TableCell>
                          <TableCell className="text-sm">{driver.rating?.toFixed(1) || '—'}</TableCell>
                          <TableCell className="text-sm text-gray-500">{formatDate(driver.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!driver.kycVerified && (
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                  disabled={actionLoading === driver.id + 'approve'}
                                  onClick={() => handleDriverAction(driver.id, 'approve')}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                              )}
                              {driver.status === 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                                  disabled={actionLoading === driver.id + 'suspend'}
                                  onClick={() => handleDriverAction(driver.id, 'suspend')}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Suspend
                                </Button>
                              )}
                              {driver.status === 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  disabled={actionLoading === driver.id + 'reactivate'}
                                  onClick={() => handleDriverAction(driver.id, 'reactivate')}
                                >
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">All Deliveries</CardTitle>
                  <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="picked_up">Picked Up</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : deliveries.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No deliveries found</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Delivery #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveries.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-mono text-xs font-medium">{d.deliveryNumber}</TableCell>
                          <TableCell className="text-sm">
                            {d.customer ? `${d.customer.firstName} ${d.customer.lastName}` : '—'}
                          </TableCell>
                          <TableCell className="text-sm">{d.driver?.fullName || '—'}</TableCell>
                          <TableCell className="text-sm max-w-48">
                            <p className="truncate text-xs text-gray-600" title={d.pickupAddress}>{d.pickupAddress}</p>
                            <p className="truncate text-xs text-gray-400" title={d.dropoffAddress}>→ {d.dropoffAddress}</p>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-600'}`}>
                              {d.status.replace(/_/g, ' ')}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm font-medium">{formatKES(d.totalAmount)}</TableCell>
                          <TableCell className="text-xs text-gray-500">{formatDate(d.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
