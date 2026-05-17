import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Order } from '@/types'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string; step: number }> = {
  PENDING:    { color: '#F59E0B', icon: 'clock',        label: 'Pending',    step: 1 },
  CONFIRMED:  { color: '#3B82F6', icon: 'check-circle', label: 'Confirmed',  step: 2 },
  PROCESSING: { color: '#8B5CF6', icon: 'loader',       label: 'Processing', step: 3 },
  SHIPPED:    { color: '#06B6D4', icon: 'truck',        label: 'Shipped',    step: 4 },
  DELIVERED:  { color: '#10B981', icon: 'check-square', label: 'Delivered',  step: 5 },
  CANCELLED:  { color: '#EF4444', icon: 'x-circle',    label: 'Cancelled',  step: 0 },
  REFUNDED:   { color: '#6B7280', icon: 'rotate-ccw',  label: 'Refunded',   step: 0 },
}

const STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered']

export default function OrderDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) loadOrder(id)
  }, [id])

  const loadOrder = async (orderId: string) => {
    setIsLoading(true)
    try {
      const response = await api.getOrder(orderId)
      // Orders API returns the raw order object directly
      if (response && response.id) {
        setOrder(response)
      } else {
        Alert.alert('Error', 'Order not found')
        router.back()
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details')
      router.back()
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    )
  }

  if (!order) return null

  const status = STATUS_CONFIG[order.status] ?? { color: '#6B7280', icon: 'circle', label: order.status, step: 0 }
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  const addr = order.shippingAddress as any

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Order ${order.orderNumber}`,
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.text.white,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: status.color }]}>
          <View style={styles.statusBannerLeft}>
            <Feather name={status.icon as any} size={32} color="#fff" />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.statusBannerLabel}>Order Status</Text>
              <Text style={styles.statusBannerValue}>{status.label}</Text>
            </View>
          </View>
          <View style={styles.paymentPill}>
            <Text style={styles.paymentPillText}>{order.paymentStatus}</Text>
          </View>
        </View>

        {/* Progress Tracker */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Progress</Text>
            <View style={styles.progressRow}>
              {STEPS.map((step, index) => {
                const done = status.step > index
                const active = status.step === index + 1
                return (
                  <View key={step} style={styles.progressStep}>
                    <View style={[
                      styles.progressDot,
                      done && styles.progressDotDone,
                      active && styles.progressDotActive,
                    ]}>
                      {done ? (
                        <Feather name="check" size={10} color="#fff" />
                      ) : (
                        <View style={[styles.progressDotInner, active && { backgroundColor: Colors.primary }]} />
                      )}
                    </View>
                    <Text style={[styles.progressLabel, (done || active) && styles.progressLabelActive]}>
                      {step}
                    </Text>
                    {index < STEPS.length - 1 && (
                      <View style={[styles.progressLine, done && styles.progressLineDone]} />
                    )}
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Number</Text>
            <Text style={styles.infoValue}>{order.orderNumber}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date Placed</Text>
            <Text style={styles.infoValue}>
              {new Date(order.createdAt).toLocaleDateString('en-KE', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment Method</Text>
            <Text style={styles.infoValue}>{order.paymentMethod || 'N/A'}</Text>
          </View>
          {order.trackingNumber && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tracking Number</Text>
                <Text style={[styles.infoValue, { color: Colors.primary, fontWeight: '700' }]}>
                  {order.trackingNumber}
                </Text>
              </View>
            </>
          )}
          {order.estimatedDelivery && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Delivery</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-KE', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ({order.items?.length || 0})</Text>
          {(order.items || []).map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => router.push(`/product/${item.productId}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.product?.images?.[0] || PLACEHOLDER_IMAGE }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>KES {Number(item.price).toLocaleString()}</Text>
                    <Text style={styles.itemTotal}> × {item.quantity} = KES {Number(item.total).toLocaleString()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Shipping Address */}
        {addr && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="map-pin" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Shipping Address</Text>
            </View>
            <Text style={styles.addressLine}>
              {[addr.firstName, addr.lastName].filter(Boolean).join(' ')}
            </Text>
            {addr.address1 && <Text style={styles.addressLine}>{addr.address1}</Text>}
            {addr.address2 && <Text style={styles.addressLine}>{addr.address2}</Text>}
            <Text style={styles.addressLine}>
              {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
            </Text>
            {addr.phone && <Text style={styles.addressLine}>{addr.phone}</Text>}
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>KES {Number(order.subtotal).toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={[styles.summaryValue, order.shipping === 0 && { color: Colors.success }]}>
              {order.shipping === 0 ? 'Free' : `KES ${Number(order.shipping).toLocaleString()}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (16%)</Text>
            <Text style={styles.summaryValue}>KES {Number(order.tax).toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>KES {Number(order.total).toLocaleString()}</Text>
          </View>
        </View>

        {/* Actions */}
{order.status === 'PENDING' && (
  <View style={styles.actionsCard}>
    <TouchableOpacity
      style={styles.dangerBtn}
      onPress={() => Alert.alert(
        'Cancel Order',
        'Are you sure you want to cancel this order?',
        [
          { text: 'Keep Order', style: 'cancel' },
          { text: 'Cancel Order', style: 'destructive', onPress: async () => {
            try {
              await api.updateOrder(order.id, { status: 'CANCELLED' });
              Alert.alert('Success', 'Order has been cancelled');
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order. Please try again.');
            }
          } },
        ]
      )}
    >
      <Feather name="x-circle" size={16} color={Colors.error} />
      <Text style={styles.dangerBtnText}>Cancel Order</Text>
    </TouchableOpacity>
  </View>
)}

        <View style={{ height: 30 }} />
      </ScrollView>
    </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundSecondary },
  loadingText: { marginTop: 12, color: Colors.text.tertiary, fontSize: 14 },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  statusBannerLeft: { flexDirection: 'row', alignItems: 'center' },
  statusBannerLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  statusBannerValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  paymentPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentPillText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 14 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    zIndex: 1,
  },
  progressDotDone: { backgroundColor: Colors.success },
  progressDotActive: { backgroundColor: Colors.primary, borderWidth: 3, borderColor: Colors.primary + '30' },
  progressDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  progressLine: {
    position: 'absolute',
    top: 14,
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: Colors.border,
    zIndex: 0,
  },
  progressLineDone: { backgroundColor: Colors.success },
  progressLabel: { fontSize: 10, color: Colors.text.muted, textAlign: 'center', fontWeight: '500' },
  progressLabelActive: { color: Colors.text.primary, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  infoLabel: { fontSize: 13, color: Colors.text.tertiary, flex: 1 },
  infoValue: { fontSize: 13, color: Colors.text.primary, fontWeight: '600', textAlign: 'right', flex: 1.5 },
  divider: { height: 1, backgroundColor: Colors.backgroundSecondary, marginVertical: 4 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8 },
  itemImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: Colors.backgroundLight, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, lineHeight: 20, marginBottom: 4 },
  itemQty: { fontSize: 12, color: Colors.text.tertiary, marginBottom: 4 },
  itemPriceRow: { flexDirection: 'row', alignItems: 'center' },
  itemPrice: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  itemTotal: { fontSize: 12, color: Colors.text.tertiary },
  addressLine: { fontSize: 14, color: Colors.text.secondary, lineHeight: 22 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontSize: 14, color: Colors.text.secondary },
  summaryValue: { fontSize: 14, color: Colors.text.primary, fontWeight: '500' },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 12, marginTop: 6 },
  totalLabel: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  totalValue: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  actionsCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dangerBtnText: { fontSize: 15, fontWeight: '700', color: Colors.error },
})
