import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
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
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Processing your order...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Animation */}
        <View style={styles.successAnimationContainer}>
          <MaterialCommunityIcons
            name="check-circle"
            size={100}
            color="#27ae60"
          />
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
              <Text style={[styles.statusBadge, { color: colors.warning }]}>{order.status}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.orderRow}>
              <Text style={styles.orderLabel}>Estimated Delivery</Text>
              <Text style={styles.orderValue}>
                3-5 business days
              </Text>
            </View>

            {order.items && order.items.length > 0 && (
              <>
                <View style={styles.divider} />

                <Text style={styles.itemsTitle}>Items Ordered</Text>
                {order.items.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemImageContainer}>
                      {item.product?.images && item.product?.images.length > 0 ? (
                        <Image
                          source={{ uri: item.product.images[0] }}
                          style={styles.itemImage}
                        />
                      ) : (
                        <View style={[styles.itemImageContainer, styles.itemPlaceholder]}>
                          <MaterialCommunityIcons
                            name="package"
                            size={24}
                            color="#bdc3c7"
                          />
                        </View>
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.product?.name || 'Product'}
                      </Text>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemQtyText}>x{item.quantity}</Text>
                        <Text style={styles.itemPrice}>
                          KES {Number(item.price * item.quantity).toLocaleString()}
                        </Text>
                      </View>
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
          style={[styles.primaryButton, styles.buttonFull]}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Text style={styles.buttonText}>View My Orders</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, styles.buttonFull]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Continue Shopping</Text>
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
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']
  title: string
  description: string
}) {
  return (
    <View style={styles.actionItem}>
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#bdc3c7" />
    </View>
  )
}

const colors = {
  primary: '#3498db',
  success: '#27ae60',
  info: '#3498db',
  warning: '#f39c12',
  error: '#e74c3c',
  text: {
    primary: '#2c3e50',
    secondary: '#7f8c8d',
    muted: '#bdc3c7',
    white: '#ffffff',
  },
  background: '#ffffff',
  cardBackground: '#ffffff',
  divider: '#ecf0f1',
} as const;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  successAnimationContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  orderCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  orderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d5f5e3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f39c12',
    backgroundColor: '#fef9e7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    marginTop: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  itemPlaceholder: {
    backgroundColor: colors.divider,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemQtyText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.divider,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  actionsList: {
    gap: 12,
  },
  actionItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d6eaf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.divider,
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFull: {
    width: '100%',
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})
