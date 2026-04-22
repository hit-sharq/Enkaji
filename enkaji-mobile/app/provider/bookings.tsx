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
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
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

export default function ProviderBookingsScreen() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response: any = await api.getProviderBookings()
      if (Array.isArray(response)) {
        setBookings(response)
      } else if (response && Array.isArray(response.bookings)) {
        setBookings(response.bookings)
      }
    } catch (error) {
      console.error('Error loading provider bookings:', error)
    } finally {
      setIsLoading(false)
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

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'confirm')
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'CONFIRMED' as Booking['status'] }
            : b
        )
      )
      Alert.alert('Confirmed', 'Booking has been confirmed')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to confirm booking')
    }
  }

  const handleCompleteBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'complete')
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'COMPLETED' as Booking['status'] }
            : b
        )
      )
      Alert.alert('Completed', 'Booking has been marked as completed')
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete booking')
    }
  }

  const handleDeclineBooking = (bookingId: string) => {
    Alert.alert(
      'Decline Booking',
      'Are you sure you want to decline this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.updateBookingStatus(bookingId, 'cancel', 'Declined by provider')
              setBookings((prev) =>
                prev.map((b) =>
                  b.id === bookingId
                    ? { ...b, status: 'CANCELLED' as Booking['status'] }
                    : b
                )
              )
              Alert.alert('Declined', 'Booking has been declined')
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to decline booking')
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
    const customerName = item.customer
      ? `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim() || item.customerName
      : item.customerName

    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.service.name}</Text>
            <Text style={styles.customerName}>{customerName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
            <Feather name={config.icon as any} size={12} color="#fff" />
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={14} color={Colors.text.tertiary} />
            <Text style={styles.detailText}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="clock" size={14} color={Colors.text.tertiary} />
            <Text style={styles.detailText}>{item.timeSlot}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceValue}>KSh {item.price.toLocaleString()}</Text>
        </View>

        {item.status === 'PENDING' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={() => handleConfirmBooking(item.id)}
            >
              <Feather name="check" size={14} color="#fff" />
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDeclineBooking(item.id)}
            >
              <Feather name="x" size={14} color="#EF4444" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === 'CONFIRMED' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleCompleteBooking(item.id)}
            >
              <Feather name="check-circle" size={14} color="#fff" />
              <Text style={styles.completeButtonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )
  }

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="calendar" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No bookings</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'ALL'
          ? 'Bookings will appear here'
          : `No ${STATUS_CONFIG[activeTab]?.label ?? activeTab} bookings`}
      </Text>
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
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          data={TABS}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item: tab }) => {
            const count = tab === 'ALL' ? bookings.length : bookings.filter((b) => b.status === tab).length
            const isActive = activeTab === tab
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab === 'ALL' ? 'All' : STATUS_CONFIG[tab]?.label ?? tab}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />
      </View>

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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  tabBadgeTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  bookingCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text.primary,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 13,
    color: Colors.text.secondary,
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
    color: Colors.text.tertiary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 13,
    color: Colors.text.tertiary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  confirmButton: {
    backgroundColor: '#10B981',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  declineButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    color: '#fff',
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
    color: Colors.text.primary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 8,
    textAlign: 'center',
  },
})