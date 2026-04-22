import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBookingsStore } from '@/lib/store'
import { Booking } from '@/types'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  PENDING:    { color: '#F59E0B', icon: 'clock',        label: 'Pending' },
  CONFIRMED:  { color: '#3B82F6', icon: 'check-circle', label: 'Confirmed' },
  COMPLETED:  { color: '#10B981', icon: 'check-square', label: 'Completed' },
  CANCELLED:  { color: '#EF4444', icon: 'x-circle',    label: 'Cancelled' },
}

const TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function MyBookingsScreen() {
  const router = useRouter()
  const { bookings, setBookings, isLoading, setLoading } = useBookingsStore()

  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  const loadBookings = useCallback(async () => {
    setLoading(true)
    try {
      const response: any = await api.getMyBookings()
      if (response && response.bookings) {
        setBookings(response.bookings)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadBookings()
    setRefreshing(false)
  }

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response: any = await api.cancelBooking(bookingId)
              if (response) {
                // Update local state
                setBookings(
                  bookings.map((b) =>
                    b.id === bookingId
                      ? { ...b, status: 'CANCELLED' as Booking['status'] }
                      : b
                  )
                )
                Alert.alert('Cancelled', 'Your booking has been cancelled')
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel')
            }
          },
        },
      ]
    )
  }

  const filteredBookings = activeTab === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === activeTab)

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const config = STATUS_CONFIG[item.status]
    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => router.push(`/bookings/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.service.name}</Text>
            <Text style={styles.providerName}>{item.provider.businessName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            <Feather name={config.icon as any} size={12} color="#fff" />
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
        </View>

          <View style={styles.bookingDetails}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={14} color={Colors.text.secondary} />
              <Text style={styles.detailText}>
                {new Date(item.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Feather name="clock" size={14} color={Colors.text.secondary} />
              <Text style={styles.detailText}>{item.timeSlot}</Text>
            </View>
          </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>KSh {item.price.toLocaleString()}</Text>
        </View>

        {item.status === 'PENDING' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelBooking(item.id)}
          >
            <Feather name="x" size={14} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No bookings yet</Text>
      <Text style={styles.emptySubtitle}>Explore services and book your first appointment</Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => router.push('/services' as any)}
      >
        <Text style={styles.exploreButtonText}>Explore Services</Text>
      </TouchableOpacity>
    </View>
  )

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {filteredBookings.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  )
}

const HEADER_HEIGHT = 60

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    height: HEADER_HEIGHT,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  bookingDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: '#888',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    gap: 6,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
