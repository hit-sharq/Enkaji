import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBookingsStore } from '@/lib/store'
import { Booking } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  PENDING:    { color: '#F59E0B', icon: 'clock',        label: 'Pending' },
  CONFIRMED:  { color: '#3B82F6', icon: 'check-circle', label: 'Confirmed' },
  COMPLETED:  { color: '#10B981', icon: 'check-square', label: 'Completed' },
  CANCELLED:  { color: '#EF4444', icon: 'x-circle',    label: 'Cancelled' },
}

export default function BookingDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { bookings, setBookings } = useBookingsStore()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadBooking = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    try {
      const response = await api.getBooking(id)
      if (response && response.id) {
        setBooking(response)
      } else if (response?.booking) {
        setBooking(response.booking)
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      Alert.alert('Error', 'Failed to load booking details')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBooking()
  }, [id])

  const handleCancelBooking = async () => {
    if (!booking) return
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true)
            try {
              await api.cancelBooking(booking.id)
              const updated = { ...booking, status: 'CANCELLED' as Booking['status'] }
              setBooking(updated)
              setBookings(
                bookings.map((b) => (b.id === booking.id ? updated : b))
              )
              Alert.alert('Cancelled', 'Your booking has been cancelled')
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel booking')
            } finally {
              setIsCancelling(false)
            }
          },
        },
      ]
    )
  }

  const handleReschedule = () => {
    Alert.alert('Reschedule', 'Reschedule functionality coming soon!')
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    )
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.text.muted} />
        <Text style={styles.errorText}>Booking not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const statusConfig = STATUS_CONFIG[booking.status] || { color: '#6B7280', icon: 'circle', label: booking.status }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Booking Details',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text.white,
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Status Banner */}
          <View style={[styles.statusBanner, { backgroundColor: statusConfig.color }]}>
            <Feather name={statusConfig.icon as any} size={24} color="#fff" />
            <Text style={styles.statusTextLarge}>{statusConfig.label}</Text>
          </View>

          {/* Service Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Service</Text>
            </View>
            <View style={styles.serviceRow}>
              <View style={styles.serviceIconBg}>
                <Feather name="briefcase" size={24} color={Colors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{booking.service.name}</Text>
                <Text style={styles.providerName}>{booking.provider.businessName}</Text>
              </View>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Booking Details</Text>
            </View>
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Feather name="calendar" size={18} color={Colors.primary} />
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(booking.date).toLocaleDateString('en-KE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="clock" size={18} color={Colors.primary} />
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>{booking.timeSlot}</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="users" size={18} color={Colors.primary} />
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{booking.duration} minutes</Text>
              </View>
              <View style={styles.detailItem}>
                <Feather name="user" size={18} color={Colors.primary} />
                <Text style={styles.detailLabel}>Booked For</Text>
                <Text style={styles.detailValue}>{booking.customerName}</Text>
              </View>
            </View>
            {booking.notes && (
              <View style={[styles.noteBox, { marginTop: 16 }]}>
                <Feather name="message-square" size={16} color={Colors.text.secondary} />
                <Text style={styles.noteText}>{booking.notes}</Text>
              </View>
            )}
          </View>

          {/* Contact Info */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contact Information</Text>
            </View>
            <View style={styles.contactRow}>
              <Feather name="phone" size={18} color={Colors.primary} />
              <Text style={styles.contactText}>{booking.customerPhone}</Text>
            </View>
            {booking.customerEmail && (
              <View style={styles.contactRow}>
                <Feather name="mail" size={18} color={Colors.primary} />
                <Text style={styles.contactText}>{booking.customerEmail}</Text>
              </View>
            )}
          </View>

          {/* Payment */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Payment</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.paymentLabelCol}>
                <Text style={styles.paymentLabel}>Price</Text>
                <Text style={styles.paymentLabel}>Payment Status</Text>
                <Text style={styles.paymentLabel}>Payment Method</Text>
              </View>
              <View style={styles.paymentValueCol}>
                <Text style={styles.paymentValue}>KSh {booking.price.toLocaleString()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: booking.paymentStatus === 'PAID' ? '#10B981' + '18' : '#F59E0B' + '18' }]}>
                  <Text style={[styles.statusBadgeText, { color: booking.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B' }]}>
                    {booking.paymentStatus}
                  </Text>
                </View>
                <Text style={styles.paymentMethod}>
                  {booking.paymentMethod || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>

          {/* Booking Timeline */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Booking Timeline</Text>
            </View>
            <View style={styles.timeline}>
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineAction}>Booked</Text>
                  <Text style={styles.timelineDate}>
                    {new Date(booking.createdAt).toLocaleString('en-KE')}
                  </Text>
                </View>
              </View>
              {booking.confirmedAt && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotFilled]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineAction}>Confirmed</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(booking.confirmedAt).toLocaleString('en-KE')}
                    </Text>
                  </View>
                </View>
              )}
              {booking.completedAt && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, styles.timelineDotFilled]} />
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineAction}>Completed</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(booking.completedAt).toLocaleString('en-KE')}
                    </Text>
                  </View>
                </View>
              )}
              {booking.cancelledAt && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#EF4444' }]} />
                  <View style={styles.timelineContent}>
                    <Text style={[styles.timelineAction, { color: '#EF4444' }]}>Cancelled</Text>
                    <Text style={styles.timelineDate}>
                      {new Date(booking.cancelledAt).toLocaleString('en-KE')}
                    </Text>
                    {booking.cancelReason && (
                      <Text style={styles.cancelReason}>Reason: {booking.cancelReason}</Text>
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

      {/* Action Buttons */}
      {booking.status === 'PENDING' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleReschedule}>
            <Feather name="calendar" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dangerBtn, isCancelling && { opacity: 0.7 }]}
            onPress={handleCancelBooking}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="x" size={18} color="#fff" />
                <Text style={styles.dangerBtnText}>Cancel Booking</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  </>
)
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
  },
  statusTextLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  card: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconBg: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.primary + '18',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: '48%',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabelCol: {
    gap: 12,
  },
  paymentLabel: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  paymentValueCol: {
    alignItems: 'flex-end',
    gap: 12,
  },
  paymentValue: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paymentMethod: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    marginLeft: 6,
    paddingLeft: 16,
  },
  timelineItem: {
    marginBottom: 20,
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: -20,
    top: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.border,
  },
  timelineDotFilled: {
    backgroundColor: Colors.primary,
  },
  timelineContent: {
    gap: 2,
  },
  timelineAction: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  timelineDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  cancelReason: {
    fontSize: 12,
    color: Colors.error,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  dangerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  dangerBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.white,
  },
})
