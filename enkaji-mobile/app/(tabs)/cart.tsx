import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/lib/theme'
import { api } from '@/lib/api'
import { useCartStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'
import CartItem from '@/components/ui/CartItem'
import { CartItem as CartItemType, Product } from '@/types'

export default function CartScreen() {
  const router = useRouter()
  const { items, totalItems, totalPrice, totalWeight, isLoading, setLoading, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [refreshing, setRefreshing] = useState(false)
  const [shippingRates, setShippingRates] = useState<any>(null)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)

  useEffect(() => {
    if (items.length > 0 && user) {
      syncCartWithServer()
    }
  }, [items])

  const syncCartWithServer = async () => {
    try {
      const serverCart = await api.getCart()
      // Merge local cart with server cart
      // Implementation detail - keep optimistic updates
    } catch (error) {
      console.log('Cart sync failed, using local state:', error)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await syncCartWithServer()
    setRefreshing(false)
  }

  const calculateShipping = async () => {
    if (!totalWeight || !user) return

    try {
      setLoading(true)
      const rates = await api.calculateShipping({
        items: items.map(item => ({
          id: item.productId,
          weight: item.product.weight || 1,
          value: item.product.price * item.quantity
        })),
        destination: {
          country: 'Kenya',
          city: user.location || 'Nairobi',
          state: 'Nairobi'
        }
      })
      setShippingRates(rates)
      setSelectedShipping(rates?.rates?.[0]?.id || null)
    } catch (error) {
      Alert.alert('Shipping Error', 'Unable to calculate shipping. Using flat rate.')
      setShippingRates({ flatRate: 300 })
    } finally {
      setLoading(false)
    }
  }

  const getTotalWithShipping = () => {
    const shipping = selectedShipping ? (shippingRates?.rates?.find((r: any) => r.id === selectedShipping)?.price || 300) : 0
    return totalPrice + shipping
  }

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to checkout')
      router.push('/sign-in')
      return
    }

    if (items.length === 0) return

    try {
      setLoading(true)
      const checkoutData = await api.initiateCheckoutPayment({
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: {
          // Use saved address or prompt
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          address1: '',
          city: 'Nairobi',
          state: 'Nairobi',
          postalCode: '',
          country: 'Kenya',
          phone: ''
        },
        paymentMethod: 'pesapal_mpesa'
      })

      router.push({
        pathname: '/payment-webview',
        params: { url: checkoutData.checkoutUrl }
      })
    } catch (error) {
      Alert.alert('Checkout Failed', 'Unable to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart }
      ]
    )
  }

  const shippingCost = selectedShipping ? (shippingRates?.rates?.find((r: any) => r.id === selectedShipping)?.price || 300) : 0

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={calculateShipping} style={styles.shippingButton}>
            <Ionicons name="boat-outline" size={16} color={Colors.primary} />
            <Text style={styles.shippingText}>Shipping</Text>
          </TouchableOpacity>
          {totalItems > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={18} color={Colors.text.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {totalItems === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add products to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Find Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.itemsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
              />
            }
          >
            {items.map((item) => (
              <CartItem
                key={item.id}
                id={item.id}
                product={item.product}
                quantity={item.quantity}
              />
            ))}
          </ScrollView>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>KSh {totalPrice.toLocaleString()}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>
                {shippingCost ? `KSh ${shippingCost.toLocaleString()}` : 'Calculate'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total ({totalItems} items)</Text>
              <Text style={styles.totalValue}>KSh {getTotalWithShipping().toLocaleString()}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, isLoading && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.text.white} size="small" />
              ) : (
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shippingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary + '10',
    borderRadius: 20,
  },
  shippingText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
    fontSize: 16,
  },
  itemsList: {
    flex: 1,
  },
  summary: {
    backgroundColor: Colors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  checkoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '700',
  },
})

