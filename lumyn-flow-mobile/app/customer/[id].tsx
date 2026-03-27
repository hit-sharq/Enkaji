import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import api from '@/lib/api'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', border: '#e0e0e0' }

const STATUS_STEPS = [
  { key: 'requested', label: 'Order Placed', icon: 'check-circle' },
  { key: 'assigned', label: 'Driver Assigned', icon: 'user-check' },
  { key: 'picked_up', label: 'Picked Up', icon: 'package' },
  { key: 'delivered', label: 'Delivered', icon: 'check-circle' },
]

const STATUS_COLORS: Record<string, string> = {
  requested: '#f59e0b',
  assigned: '#3b82f6',
  picked_up: '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function DeliveryTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [ratingLoading, setRatingLoading] = useState(false)

  const fetchDelivery = async () => {
    try {
      const result = await api.getDelivery(id)
      if (result.success) setDelivery(result.data)
    } catch (error) {
      console.error('Fetch delivery error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDelivery()
    const interval = setInterval(fetchDelivery, 15000)
    return () => clearInterval(interval)
  }, [id])

  const submitRating = async (stars: number) => {
    setRatingLoading(true)
    try {
      await api.rateDelivery(id, stars)
      setRating(stars)
      Alert.alert('Thank you!', 'Your rating has been submitted.')
      fetchDelivery()
    } catch {
      Alert.alert('Error', 'Could not submit rating.')
    } finally {
      setRatingLoading(false)
    }
  }

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === delivery?.status)

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  if (!delivery) {
    return (
      <SafeAreaView style={styles.centered}>
        <Feather name="alert-circle" size={40} color="#999" />
        <Text style={styles.emptyText}>Delivery not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Delivery</Text>
        <TouchableOpacity onPress={fetchDelivery}>
          <Feather name="refresh-cw" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.deliveryNumRow}>
            <Text style={styles.deliveryNum}>{delivery.deliveryNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[delivery.status] + '20' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLORS[delivery.status] }]}>
                {delivery.status.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>Placed {formatDate(delivery.createdAt)}</Text>
        </View>

        {delivery.status !== 'cancelled' && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Delivery Progress</Text>
            {STATUS_STEPS.map((step, index) => {
              const done = index <= currentStepIndex
              const active = index === currentStepIndex
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, done && styles.stepDotDone, active && styles.stepDotActive]}>
                      {done && <Feather name="check" size={12} color="#fff" />}
                    </View>
                    {index < STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, done && styles.stepLineDone]} />
                    )}
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={[styles.stepLabel, done && styles.stepLabelDone]}>{step.label}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Route</Text>
          <View style={styles.routeRow}>
            <View style={styles.routeDot}>
              <Feather name="map-pin" size={14} color={COLORS.primary} />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{delivery.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={styles.routeDot}>
              <Feather name="navigation" size={14} color="#666" />
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{delivery.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        {delivery.driver && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Your Driver</Text>
            <View style={styles.driverRow}>
              <View style={styles.driverAvatar}>
                <Feather name="user" size={22} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.driverName}>{delivery.driver.fullName}</Text>
                <View style={styles.ratingRow}>
                  <Feather name="star" size={13} color="#f59e0b" />
                  <Text style={styles.ratingText}>{delivery.driver.rating?.toFixed(1)} • {delivery.driver.totalDeliveries} deliveries</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Package</Text>
          <Text style={styles.itemDesc}>{delivery.itemDescription}</Text>
          {delivery.itemWeightKg && (
            <Text style={styles.itemMeta}>Weight: {delivery.itemWeightKg} kg</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>KES {delivery.totalAmount?.toLocaleString()}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.subLabel}>Payment</Text>
            <Text style={styles.subValue}>{delivery.paymentMethod?.toUpperCase()}</Text>
          </View>
          <View style={styles.amountRow}>
            <Text style={styles.subLabel}>Distance</Text>
            <Text style={styles.subValue}>{delivery.distanceKm?.toFixed(1)} km</Text>
          </View>
        </View>

        {delivery.status === 'delivered' && !delivery.ratings?.length && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Rate your experience</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => submitRating(star)}
                  disabled={ratingLoading || rating > 0}
                >
                  <Feather
                    name="star"
                    size={36}
                    color={star <= rating ? '#f59e0b' : '#ddd'}
                    style={{ marginHorizontal: 4 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {ratingLoading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, backgroundColor: COLORS.background },
  emptyText: { fontSize: 16, color: '#666', marginTop: 8 },
  backBtn: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 },
  backBtnText: { color: '#fff', fontWeight: '700' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  deliveryNumRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  deliveryNum: { fontSize: 16, fontWeight: '800', color: '#000' },
  statusBadge: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  dateText: { fontSize: 12, color: '#888' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  stepRow: { flexDirection: 'row', minHeight: 44 },
  stepLeft: { alignItems: 'center', width: 28 },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  stepDotDone: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  stepDotActive: { borderColor: COLORS.primary },
  stepLine: { width: 2, flex: 1, backgroundColor: '#ddd', marginVertical: 2 },
  stepLineDone: { backgroundColor: COLORS.primary },
  stepContent: { flex: 1, paddingLeft: 12, paddingBottom: 12 },
  stepLabel: { fontSize: 14, color: '#aaa', fontWeight: '500', lineHeight: 24 },
  stepLabelDone: { color: '#000', fontWeight: '600' },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 6 },
  routeDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  routeInfo: { flex: 1 },
  routeLabel: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  routeAddress: { fontSize: 14, color: '#000', fontWeight: '500', lineHeight: 20 },
  routeLine: { width: 2, height: 16, backgroundColor: '#ddd', marginLeft: 13, marginVertical: 2 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  driverAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.primary + '15', justifyContent: 'center', alignItems: 'center' },
  driverName: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 12, color: '#666' },
  itemDesc: { fontSize: 14, color: '#000', lineHeight: 20 },
  itemMeta: { fontSize: 12, color: '#888', marginTop: 6 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  amountLabel: { fontSize: 15, fontWeight: '800', color: '#000' },
  amountValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  subLabel: { fontSize: 13, color: '#888' },
  subValue: { fontSize: 13, color: '#000', fontWeight: '500' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
})
