import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useCartStore, useOrdersStore } from '@/lib/store'
import api from '@/lib/api'
import { Order } from '@/types'

export default function PaymentSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const { addOrder } = useOrdersStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrder()
    clearCart()
  }, [orderId])

  const loadOrder = async () => {
    if (!orderId) {
      setIsLoading(false)
      return
    }

    try {
      const response = await api.getOrder(orderId)
      setOrder(response)
      addOrder(response)
    } catch (error) {
      console.error('[v0] Error loading order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons
              name="check-circle"
              size={80}
              color="#27ae60"
            />
          </View>
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Payment Successful!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. Your order has been confirmed.
        </Text>

        {/* Order Details */}
        {order && (
          <View style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order Number</Text>
              <Text style={styles.orderValue}>{order.orderNumber || order.id}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Total Amount</Text>
              <Text style={styles.orderAmount}>
                KES {Number(order.total).toLocaleString()}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Payment Status</Text>
              <View style={styles.badgeContainer}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={16}
                  color="#27ae60"
                />
                <Text style={styles.badgeText}>Paid</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Order Status</Text>
              <Text style={styles.statusBadge}>{order.status}</Text>
            </View>

            {order.items && order.items.length > 0 && (
              <>
                <View style={styles.divider} />

                <Text style={styles.itemsTitle}>Items Ordered</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemName} numberOfLines={2}>
                      {item.product?.name || 'Product'}
                    </Text>
                    <View style={styles.itemQty}>
                      <Text style={styles.itemQtyText}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>
                        KES {Number(item.price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>
        )}

        {/* What's Next */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information" size={20} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What's Next?</Text>
            <Text style={styles.infoText}>
              We'll send you an email confirmation shortly. Track your order status anytime from your orders page.
            </Text>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.actionsList}>
          <ActionItem
            icon="truck"
            title="Track Your Order"
            description="Monitor shipping status in real-time"
          />
          <ActionItem
            icon="redo"
            title="Continue Shopping"
            description="Browse more products from our catalog"
          />
          <ActionItem
            icon="help-circle"
            title="Need Help?"
            description="Check our FAQ or contact support"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Text style={styles.primaryButtonText}>View My Orders</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

function ActionItem({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#3498db" />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#bdc3c7" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#7f8c8d',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  orderLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27ae60',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f39c12',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    marginTop: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#7f8c8d',
  },
  itemQty: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemQtyText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    padding: 16,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '700',
  },
})
