import { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '@/lib/store'
import { useAuth } from '@clerk/clerk-expo'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e5e5e5/666666?text=No+Image'

export default function CartScreen() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { items, totalItems, totalPrice, setItems, removeItem, updateQuantity, clearCart, isLoading, setLoading } = useCartStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = async () => {
    setLoading(true)
    try {
      const response = await api.getCart()
      // Cart API returns { items: [...], total, itemCount, currency }
      if (response && response.items) {
        setItems(response.items)
      } else if (Array.isArray(response)) {
        setItems(response)
      }
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.removeCartItem(itemId)
              removeItem(itemId)
              Alert.alert('Success', 'Item removed from cart')
            } catch (error) {
              console.error('Error removing item:', error)
              Alert.alert('Error', 'Failed to remove item. Please try again.')
            }
          }
        },
      ]
    )
  }

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    try {
      await api.updateCartItem(itemId, newQuantity)
      updateQuantity(itemId, newQuantity)
    } catch (error) {
      console.error('Error updating quantity:', error)
    }
  }

  const handleCheckout = () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Add some products to your cart first!')
      return
    }
    if (!isSignedIn) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in before placing an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') },
        ]
      )
      return
    }
    router.push('/checkout')
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCart()
    setRefreshing(false)
  }

  if (isLoading && items.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Feather name="shopping-cart" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add some products to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.headerSubtitle}>{totalItems} item{totalItems !== 1 ? 's' : ''} in your cart</Text>
            </View>
            
            {items.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Image 
                  source={{ uri: item.product?.images?.[0] || PLACEHOLDER_IMAGE }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.itemPrice}>
                    KES {(item.product?.price || 0).toLocaleString()}
                  </Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Feather name="minus" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Feather name="plus" size={16} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(item.id)}
                >
                  <Feather name="trash-2" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal ({totalItems} items)</Text>
                <Text style={styles.summaryValue}>KES {totalPrice.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValueSecondary}>Calculated at checkout</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>KES {totalPrice.toLocaleString()}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Feather name="lock" size={18} color={Colors.text.white} />
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
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
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 8,
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  itemPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 16,
    color: Colors.text.primary,
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    backgroundColor: Colors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  summary: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  summaryValueSecondary: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 6,
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
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutButtonText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 10,
  },
})

