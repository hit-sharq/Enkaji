import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useServicesStore } from '@/lib/store'
import { Service, WorkingHour, ServiceReview } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const SCREEN_WIDTH = Dimensions.get('window').width

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
]

const generateDates = () => {
  const dates = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

export default function ServiceDetailScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ id: string }>()
  const { currentService, setCurrentService, setLoading, isLoading } = useServicesStore()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoadingState] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  useEffect(() => {
    if (params.id) {
      fetchService(params.id)
    }
  }, [params.id])

  const fetchService = async (id: string) => {
    setLoadingState(true)
    setLoading(true)
    try {
      const response = await api.getService(id)
      if (response.service) {
        const serviceData = response.service as Service
        setService(serviceData)
        setCurrentService(serviceData)
      }
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoadingState(false)
      setLoading(false)
    }
  }

  const dates = generateDates()

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Select Date & Time', 'Please select both a date and time for your booking')
      return
    }
    if (!customerInfo.name || !customerInfo.phone) {
      Alert.alert('Missing Information', 'Please provide your name and phone number')
      return
    }

    setSubmitting(true)
    try {
      const response: any = await api.createBooking({
        serviceId: service!.id,
        date: selectedDate.toISOString(),
        timeSlot: selectedTime,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email || undefined,
        notes: customerInfo.notes || undefined,
      })

      if (response) {
        setBookingStep(3)
      } else {
        throw new Error(response.error || 'Failed to book')
      }
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Please try again')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name="star"
            size={16}
            color={star <= rating ? Colors.primary : '#ddd'}
            fill={star <= rating ? Colors.primary : 'none'}
          />
        ))}
      </View>
    )
  }

  const renderWorkingHours = (hours: WorkingHour[]) => {
    const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return (
      <View style={styles.workingHoursContainer}>
        {dayOrder.map((day) => {
          const dayData = hours.find((h) => h.day.toLowerCase() === day)
          return (
            <View key={day} style={styles.workingHourRow}>
              <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</Text>
              <Text style={[styles.timeText, !dayData?.isOpen && styles.closedText]}>
                {dayData?.isOpen ? `${dayData?.openTime} - ${dayData?.closeTime}` : 'Closed'}
              </Text>
            </View>
          )
        })}
      </View>
    )
  }

  const renderReviewItem = (review: ServiceReview) => (
    <View key={review.id} style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerAvatar}>
          <Text style={styles.reviewerInitial}>
            {review.customer?.firstName?.charAt(0) || review.customerName?.charAt(0) || 'A'}
          </Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewerName}>
            {review.customer?.firstName || review.customerName || 'Anonymous'} {review.customer?.lastName || ''}
          </Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.reviewRating}>
          {renderStars(review.rating)}
        </View>
      </View>
      {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!service) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Service not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: service.images?.[0] || PLACEHOLDER_IMAGE }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
          {service.provider.isVerified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color="#10b981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Service Info */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <View style={styles.titleSection}>
              <Text style={styles.category}>{service.category}</Text>
              <Text style={styles.serviceName}>{service.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="share-2" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="heart" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating & Price */}
          <View style={styles.ratingRow}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Feather
                  key={star}
                  name="star"
                  size={16}
                  color={star <= Math.round(service.averageRating) ? Colors.primary : '#ddd'}
                  fill={star <= Math.round(service.averageRating) ? Colors.primary : 'none'}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {service.averageRating.toFixed(1)} ({service.totalReviews} reviews)
            </Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>KSh {service.price.toLocaleString()}</Text>
            </View>
          </View>

          {/* Duration & Location */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={16} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{service.duration} minutes</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="map-pin" size={16} color={Colors.text.secondary} />
              <Text style={styles.metaText}>{service.location}</Text>
            </View>
          </View>

          {/* Booking CTA */}
          {bookingStep === 1 && (
            <TouchableOpacity
              style={styles.bookNowButton}
              onPress={() => setBookingStep(2)}
            >
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Service</Text>
            <Text style={styles.description}>{service.description}</Text>
          </View>

          {/* Working Hours */}
          {service.workingHours && service.workingHours.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Provider Availability</Text>
              {renderWorkingHours(service.workingHours)}
            </View>
          )}

          {/* Provider Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About the Provider</Text>
            <TouchableOpacity
              style={styles.providerCard}
              onPress={() => router.push(`/providers/${service.provider.slug}` as any)}
            >
              <View style={styles.providerInfo}>
                <View style={styles.providerAvatar}>
                  <Text style={styles.providerAvatarText}>
                    {service.provider.businessName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.providerDetails}>
                  <View style={styles.providerNameRow}>
                    <Text style={styles.providerName}>{service.provider.businessName}</Text>
                    {service.provider.isVerified && (
                      <Feather name="check-circle" size={16} color="#10b981" style={{ marginLeft: 4 }} />
                    )}
                  </View>
                  <Text style={styles.providerMeta}>
                    {service.provider.yearsExperience} years experience
                  </Text>
                  <Text style={styles.providerMeta}>
                    {service.provider.totalReviews} reviews
                  </Text>
                </View>
              </View>
              <View style={styles.contactActions}>
                <TouchableOpacity style={styles.contactButton}>
                  <Feather name="phone" size={16} color={Colors.primary} />
                  <Text style={styles.contactButtonText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Feather name="message-circle" size={16} color="#fff" />
                  <Text style={[styles.contactButtonText, { color: '#fff' }]}>Message</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {service.reviews && service.reviews.length > 0 ? (
              <View style={styles.reviewsList}>
                {service.reviews.map(renderReviewItem)}
              </View>
            ) : (
              <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
            )}
          </View>

          {/* Trust Badges */}
          <View style={styles.section}>
            <View style={styles.trustBadge}>
              <Feather name="shield" size={20} color="#10b981" />
              <View style={styles.trustBadgeText}>
                <Text style={styles.trustBadgeTitle}>Secure Booking</Text>
                <Text style={styles.trustBadgeSub}>Protected by Enkaji</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Booking Step 2 - Date/Time & Form */}
        {bookingStep === 2 && (
          <View style={styles.bookingOverlay}>
            <View style={styles.bookingPanel}>
              <View style={styles.bookingHeader}>
                <TouchableOpacity onPress={() => setBookingStep(1)}>
                  <Feather name="chevron-left" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.bookingTitle}>Confirm Booking</Text>
                <TouchableOpacity onPress={() => setBookingStep(1)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Summary */}
                <View style={styles.bookingSummary}>
                  <Text style={styles.bookingSummaryTitle}>{service.name}</Text>
                  <Text style={styles.bookingProvider}>{service.provider.businessName}</Text>
                </View>

                {/* Date */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Select Date</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesScroll}>
                    {dates.map((date) => {
                      const isSelected = selectedDate?.toDateString() === date.toDateString()
                      return (
                        <TouchableOpacity
                          key={date.toISOString()}
                          style={[styles.dateChip, isSelected && styles.dateChipSelected]}
                          onPress={() => setSelectedDate(date)}
                        >
                          <Text style={styles.dateDayName}>
                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                          </Text>
                          <Text style={[styles.dateDayNum, isSelected && styles.dateDaySelected]}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>

                {/* Time */}
                {selectedDate && (
                  <View style={styles.formSection}>
                    <Text style={styles.formLabel}>Select Time</Text>
                    <View style={styles.timeGrid}>
                      {TIME_SLOTS.map((time) => {
                        const isSelected = selectedTime === time
                        return (
                          <TouchableOpacity
                            key={time}
                            style={[styles.timeChip, isSelected && styles.timeChipSelected]}
                            onPress={() => setSelectedTime(time)}
                          >
                            <Text style={[styles.timeChipText, isSelected && styles.timeChipTextSelected]}>
                              {time}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  </View>
                )}

                {/* Customer Form */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Your Information</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your name"
                      value={customerInfo.name}
                      onChangeText={(text: string) => setCustomerInfo({ ...customerInfo, name: text })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Phone Number *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="07XX XXX XXX"
                      keyboardType="phone-pad"
                      value={customerInfo.phone}
                      onChangeText={(text: string) => setCustomerInfo({ ...customerInfo, phone: text })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email (optional)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      keyboardType="email-address"
                      value={customerInfo.email}
                      onChangeText={(text: string) => setCustomerInfo({ ...customerInfo, email: text })}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Special requests?</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Any special requirements..."
                      multiline
                      numberOfLines={3}
                      value={customerInfo.notes}
                      onChangeText={(text: string) => setCustomerInfo({ ...customerInfo, notes: text })}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                  onPress={handleBooking}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Confirm Booking - KSh {service.price.toLocaleString()}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        )}

        {/* Booking Step 3 - Confirmed */}
        {bookingStep === 3 && (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Booking Submitted!</Text>
            <Text style={styles.successText}>
              The provider will confirm your appointment shortly via SMS.
            </Text>
            <TouchableOpacity
              style={styles.viewBookingsButton}
              onPress={() => router.push('/bookings' as any)}
            >
              <Text style={styles.viewBookingsText}>View My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookAnotherButton}
              onPress={() => {
                setBookingStep(1)
                setSelectedDate(null)
                setSelectedTime(null)
                setCustomerInfo({ name: '', phone: '', email: '', notes: '' })
              }}
            >
              <Text style={styles.bookAnotherText}>Book Another</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  backLink: { color: Colors.primary, marginTop: 12, fontSize: 16 },
  imageContainer: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.6, backgroundColor: '#f3f4f6' },
  serviceImage: { width: '100%', height: '100%' },
  verifiedBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  verifiedText: { color: '#10b981', fontWeight: '600', fontSize: 12 },
  contentContainer: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleSection: { flex: 1, marginRight: 12 },
  category: { fontSize: 12, color: Colors.primary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  serviceName: { fontSize: 24, fontWeight: '700', color: '#111', lineHeight: 30 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconButton: { padding: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
  starsRow: { flexDirection: 'row', gap: 2 },
  ratingText: { fontSize: 14, color: '#666' },
  priceTag: { marginLeft: 'auto', backgroundColor: '#fef3f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  priceText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: '#666' },
  bookNowButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 24 },
  bookNowText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, color: '#111' },
  description: { fontSize: 15, lineHeight: 24, color: '#444' },
  workingHoursContainer: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 12 },
  workingHourRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  dayText: { fontSize: 14, fontWeight: '500', width: 50 },
  timeText: { fontSize: 14, color: '#666' },
  closedText: { color: '#999', fontStyle: 'italic' },
  providerCard: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  providerInfo: { flexDirection: 'row', marginBottom: 12 },
  providerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  providerAvatarText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  providerDetails: { flex: 1, justifyContent: 'center' },
  providerNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  providerName: { fontSize: 16, fontWeight: '600', color: '#111' },
  providerMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  contactActions: { flexDirection: 'row', gap: 12 },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#fff',
    gap: 6,
  },
  messageButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },
  reviewsList: { gap: 16 },
  reviewItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 16 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  reviewerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewerInitial: { color: '#666', fontWeight: '600' },
  reviewMeta: { flex: 1 },
  reviewerName: { fontSize: 14, fontWeight: '600', color: '#111' },
  reviewDate: { fontSize: 12, color: '#999' },
  reviewRating: { marginLeft: 'auto' },
  reviewTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: '#111' },
  reviewComment: { fontSize: 14, lineHeight: 20, color: '#444' },
  noReviews: { color: '#999', textAlign: 'center', padding: 20, fontStyle: 'italic' },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 12,
  },
  trustBadgeText: {},
  trustBadgeTitle: { fontSize: 15, fontWeight: '600', color: '#065f46' },
  trustBadgeSub: { fontSize: 12, color: '#047857' },

  // Booking Step 2 styles
  bookingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
  bookingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bookingTitle: { fontSize: 18, fontWeight: '600' },
  cancelText: { color: Colors.primary, fontWeight: '500' },
  bookingSummary: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  bookingSummaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  bookingProvider: { fontSize: 14, color: '#666' },
  formSection: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  formLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111' },
  datesScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
  dateChip: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDayName: { fontSize: 12, color: '#666', marginBottom: 2 },
  dateDayNum: { fontSize: 18, fontWeight: '700', color: '#111' },
  dateDaySelected: { color: '#fff' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  timeChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeChipText: { fontSize: 14, color: '#111' },
  timeChipTextSelected: { color: '#fff' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  submitButton: {
    backgroundColor: Colors.primary,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  // Step 3
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#111' },
  successText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32, lineHeight: 24 },
  viewBookingsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  viewBookingsText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bookAnotherButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  bookAnotherText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
})
