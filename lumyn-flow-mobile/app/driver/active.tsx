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
import { useDeliveryStore } from '@/lib/store'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', border: '#e0e0e0', green: '#10b981' }

const STEPS: Record<string, { label: string; nextAction: string; nextLabel: string; nextIcon: string }> = {
  assigned: { label: 'Head to pickup location', nextAction: 'pickup', nextLabel: 'Confirm Pickup', nextIcon: 'package' },
  picked_up: { label: 'Heading to dropoff', nextAction: 'deliver', nextLabel: 'Confirm Delivery', nextIcon: 'check-circle' },
  delivered: { label: 'Delivery complete!', nextAction: '', nextLabel: '', nextIcon: '' },
}

export default function ActiveJobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { updateDelivery } = useDeliveryStore()
  const [delivery, setDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await api.getDelivery(id)
        if (result.success) setDelivery(result.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleAction = async (action: string) => {
    Alert.alert(
      action === 'pickup' ? 'Confirm Pickup' : 'Confirm Delivery',
      action === 'pickup'
        ? 'Have you picked up the package from the customer?'
        : 'Have you successfully delivered the package?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(true)
            try {
              const result = await api.client.post(`/api/lumyn/deliveries/${id}`, { action })
              if (result.data.success) {
                setDelivery(result.data.data)
                updateDelivery(id, { status: result.data.data.status })
                if (action === 'deliver') {
                  Alert.alert('Delivery Complete! 🎉', `You earned KES ${Math.round(delivery.totalAmount * 0.8).toLocaleString()}`, [
                    { text: 'View Earnings', onPress: () => router.replace('/driver/earnings') },
                    { text: 'Back to Jobs', onPress: () => router.replace('/driver/home') },
                  ])
                }
              }
            } catch {
              Alert.alert('Error', 'Failed to update delivery status. Try again.')
            } finally {
              setActionLoading(false)
            }
          },
        },
      ]
    )
  }

  const handleCancel = () => {
    Alert.alert(
      'Cancel Delivery',
      'Are you sure you want to cancel? This may affect your rating.',
      [
        { text: 'Keep Job', style: 'cancel' },
        {
          text: 'Cancel Delivery',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true)
            try {
              await api.client.post(`/api/lumyn/deliveries/${id}`, { action: 'cancel' })
              router.replace('/driver/home')
            } catch {
              Alert.alert('Error', 'Failed to cancel.')
            } finally {
              setActionLoading(false)
            }
          },
        },
      ]
    )
  }

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
        <Text style={{ color: '#666' }}>Delivery not found</Text>
      </SafeAreaView>
    )
  }

  const step = STEPS[delivery.status]
  const earning = Math.round(delivery.totalAmount * 0.8)
  const isDelivered = delivery.status === 'delivered'

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Delivery</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!isDelivered ? (
          <View style={styles.statusBanner}>
            <Feather name="truck" size={20} color={COLORS.primary} />
            <Text style={styles.statusText}>{step?.label}</Text>
          </View>
        ) : (
          <View style={[styles.statusBanner, { backgroundColor: COLORS.green + '15' }]}>
            <Feather name="check-circle" size={20} color={COLORS.green} />
            <Text style={[styles.statusText, { color: COLORS.green }]}>Delivery complete!</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.deliveryNum}>{delivery.deliveryNumber}</Text>
          <View style={styles.earningRow}>
            <Feather name="dollar-sign" size={16} color={COLORS.primary} />
            <Text style={styles.earningText}>Your earning: KES {earning.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Route</Text>
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: COLORS.primary + '20' }]}>
              <Feather name="map-pin" size={14} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeRole}>Pickup</Text>
              <Text style={styles.routeAddress}>{delivery.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: '#3b82f615' }]}>
              <Feather name="navigation" size={14} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeRole}>Dropoff</Text>
              <Text style={styles.routeAddress}>{delivery.dropoffAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Package Details</Text>
          <Text style={styles.itemDesc}>{delivery.itemDescription}</Text>
          {delivery.itemWeightKg && (
            <Text style={styles.itemMeta}>Weight: {delivery.itemWeightKg} kg</Text>
          )}
          {delivery.specialHandling && (
            <View style={styles.specialRow}>
              <Feather name="alert-triangle" size={14} color="#f59e0b" />
              <Text style={styles.specialText}>{delivery.specialHandling}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer</Text>
          <Text style={styles.customerName}>
            {delivery.customer?.firstName} {delivery.customer?.lastName}
          </Text>
          {delivery.customer?.email && (
            <Text style={styles.customerEmail}>{delivery.customer.email}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Total Amount</Text>
            <Text style={styles.feeValue}>KES {delivery.totalAmount?.toLocaleString()}</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeSubLabel}>Distance</Text>
            <Text style={styles.feeSubValue}>{delivery.distanceKm?.toFixed(1)} km</Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeSubLabel}>Payment</Text>
            <Text style={styles.feeSubValue}>{delivery.paymentMethod?.toUpperCase()}</Text>
          </View>
        </View>
      </ScrollView>

      {!isDelivered && step?.nextAction && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            disabled={actionLoading}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, actionLoading && { opacity: 0.7 }]}
            onPress={() => handleAction(step.nextAction)}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name={step.nextIcon as any} size={18} color="#fff" />
                <Text style={styles.actionBtnText}>{step.nextLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isDelivered && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.replace('/driver/home')}
          >
            <Feather name="home" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Find More Jobs</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  content: { padding: 16, gap: 14, paddingBottom: 100 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.primary + '10', borderRadius: 12, padding: 14 },
  statusText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  deliveryNum: { fontSize: 16, fontWeight: '800', color: '#000', marginBottom: 8 },
  earningRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  earningText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  routeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 4 },
  routeDot: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  routeConnector: { width: 2, height: 14, backgroundColor: '#ddd', marginLeft: 14, marginVertical: 2 },
  routeRole: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  routeAddress: { fontSize: 14, color: '#000', fontWeight: '500', lineHeight: 20 },
  itemDesc: { fontSize: 14, color: '#000', lineHeight: 20, marginBottom: 6 },
  itemMeta: { fontSize: 12, color: '#888' },
  specialRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 8, backgroundColor: '#fef3c715', borderRadius: 8, padding: 8 },
  specialText: { fontSize: 12, color: '#92400e', flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 4 },
  customerEmail: { fontSize: 13, color: '#888' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feeLabel: { fontSize: 15, fontWeight: '800', color: '#000' },
  feeValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  feeSubLabel: { fontSize: 13, color: '#888' },
  feeSubValue: { fontSize: 13, color: '#000', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  cancelBtn: { borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: '#666', fontWeight: '600', fontSize: 14 },
  actionBtn: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
