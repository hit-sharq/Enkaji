import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/store'
import { Booking } from '@/types'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

interface ProviderStats {
  totalServices: number
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalEarnings: number
}

export default function ProviderDashboardScreen() {
  const router = useRouter()
  const { user } = useAuthStore()

  const [stats, setStats] = useState<ProviderStats>({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [servicesRes, bookingsRes] = await Promise.all([
        api.getMyServices(),
        api.getProviderBookings(),
      ])

      const services: any[] = (servicesRes as any)?.services || []
      const bookings: Booking[] = (bookingsRes as any)?.bookings || []

      const completed = bookings.filter((b) => b.status === 'COMPLETED')
      const pending = bookings.filter((b) => b.status === 'PENDING')

      const totalEarnings = completed.reduce((sum, b) => sum + b.price, 0)

      setStats({
        totalServices: services.length,
        totalBookings: bookings.length,
        pendingBookings: pending.length,
        completedBookings: completed.length,
        totalEarnings,
      })

      setRecentBookings(bookings.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const StatCard = ({ label, value, icon, color, onPress }: {
    label: string
    value: string | number
    icon: string
    color: string
    onPress?: () => void
  }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Feather name={icon as any} size={24} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )

  const BookingItem = ({ item }: { item: Booking }) => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      PENDING:    { color: '#F59E0B', icon: 'clock' },
      CONFIRMED:  { color: '#3B82F6', icon: 'check-circle' },
      COMPLETED:  { color: '#10B981', icon: 'check-square' },
      CANCELLED:  { color: '#EF4444', icon: 'x-circle' },
    }
    const config = statusConfig[item.status] || statusConfig.PENDING

    return (
      <View style={styles.bookingItem}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingService}>{item.service.name}</Text>
          <Text style={styles.bookingDate}>
            {new Date(item.date).toLocaleDateString()} at {item.timeSlot}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
          <Feather name={config.icon as any} size={12} color="#fff" />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Provider Dashboard</Text>
          <Text style={styles.subGreeting}>
            {user?.firstName ? `Welcome, ${user.firstName}` : 'Welcome back'}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Services"
            value={stats.totalServices}
            icon="briefcase"
            color={Colors.primary}
            onPress={() => router.push('/provider/services' as any)}
          />
          <StatCard
            label="Bookings"
            value={stats.totalBookings}
            icon="calendar"
            color="#8B5CF6"
            onPress={() => router.push('/provider/bookings' as any)}
          />
          <StatCard
            label="Earnings"
            value={`KSh ${stats.totalEarnings.toLocaleString()}`}
            icon="trending-up"
            color="#10B981"
          />
          <StatCard
            label="Pending"
            value={stats.pendingBookings}
            icon="clock"
            color="#F59E0B"
            onPress={() => router.push('/provider/bookings?status=PENDING' as any)}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/provider/services/add' as any)}
            >
              <Feather name="plus-circle" size={28} color={Colors.primary} />
              <Text style={styles.actionLabel}>Add Service</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/provider/availability' as any)}
            >
              <Feather name="clock" size={28} color="#8B5CF6" />
              <Text style={styles.actionLabel}>Availability</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push('/provider/bookings' as any)}
            >
              <Feather name="calendar" size={28} color="#10B981" />
              <Text style={styles.actionLabel}>Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            {recentBookings.length > 0 && (
              <TouchableOpacity onPress={() => router.push('/provider/bookings' as any)}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          {recentBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={32} color="#ccc" />
              <Text style={styles.emptyStateText}>No bookings yet</Text>
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {recentBookings.map((booking) => (
                <BookingItem key={booking.id} item={booking} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const SCREEN_WIDTH = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 32,
  },
  greeting: { fontSize: 26, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subGreeting: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: -24,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4, textAlign: 'center' },
  statLabel: { fontSize: 13, color: '#666', textAlign: 'center' },
  section: { backgroundColor: '#fff', padding: 16, marginBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  viewAllText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  actionLabel: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#333' },
  bookingsList: { gap: 12 },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  bookingInfo: { flex: 1 },
  bookingService: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },
  bookingDate: { fontSize: 13, color: '#666' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  emptyState: { padding: 24, alignItems: 'center' },
  emptyStateText: { color: '#999', fontStyle: 'italic', marginTop: 8 },
})
