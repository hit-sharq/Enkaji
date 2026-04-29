import { useState, useEffect } from 'react'

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import * as Location from 'expo-location'

import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '@/lib/store'
import { useAuth, useUser } from '@clerk/clerk-expo'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

export default function CheckoutScreen() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const { user: clerkUser } = useUser()
  const { items, totalItems, totalPrice, totalWeight, clearCart } = useCartStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('PESAPAL')
  const [shippingCost, setShippingCost] = useState(0)
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    country: 'Kenya',
  })

  useEffect(() => {
    const checkServerAuth = async () => {
      try {
        await api.checkAuth()
      } catch {
        Alert.alert(
          'Session Expired',
          'Please sign in again to continue.',
          [
            { text: 'Cancel', onPress: () => router.back() },
            { text: 'Sign In', onPress: () => router.replace('/(auth)/sign-in') },
          ]
        )
      }
    }
    if (!isSignedIn) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to place an order.',
        [
          { text: 'Cancel', onPress: () => router.back() },
          { text: 'Sign In', onPress: () => router.replace('/(auth)/sign-in') },
        ]
      )
    } else {
      checkServerAuth()
    }
  }, [isSignedIn])

  useEffect(() => {
    if (clerkUser) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: prev.firstName || clerkUser.firstName || '',
        lastName: prev.lastName || clerkUser.lastName || '',
        phone: prev.phone || (clerkUser.phoneNumbers?.[0]?.phoneNumber ?? ''),
      }))
    }
  }, [clerkUser])

  // Fetch real shipping cost when address changes
  useEffect(() => {
    const fetchShipping = async () => {
      if (!shippingAddress.city || !shippingAddress.country || items.length === 0) {
        setShippingCost(0)
        return
      }
      setShippingLoading(true)
      try {
        const response = await api.calculateShipping({
          items: items.map((item) => ({
            id: item.productId,
            weight: item.product?.weight || 0.5,
            value: (item.product?.price || 0) * item.quantity,
          })),
          destination: {
            country: shippingAddress.country,
            city: shippingAddress.city,
            state: shippingAddress.state,
          },
        })
        // Backend returns {success, data} - check accordingly
        const result = response as any
        if (result?.success && result.data?.shipping?.options?.length > 0) {
          const recommended = result.data.shipping.options.find((o: any) => o.isRecommended)
          setShippingCost(recommended?.price || result.data.shipping.options[0].price)
        } else {
          // Fallback: free shipping over 5000, else 500
          setShippingCost(totalPrice > 5000 ? 0 : 500)
        }
      } catch (error) {
        console.error('Shipping calculation error:', error)
        setShippingCost(totalPrice > 5000 ? 0 : 500)
      } finally {
        setShippingLoading(false)
      }
    }
    fetchShipping()
  }, [shippingAddress.city, shippingAddress.country, shippingAddress.state, items, totalPrice])

  // Consistent tax calculation (no rounding — same as web)
  const tax = totalPrice * 0.16
  const orderTotal = totalPrice + shippingCost + tax

  const handlePlaceOrder = async () => {
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.address1 ||
      !shippingAddress.city ||
      !shippingAddress.phone
    ) {
      Alert.alert('Error', 'Please fill in all required shipping details')
      return
    }

    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty')
      return
    }

    setIsProcessing(true)
    try {
      const formattedShipping = {
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        address: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.postalCode,
        phone: shippingAddress.phone,
        country: shippingAddress.country,
      }

      if (paymentMethod === 'PESAPAL') {
        // NEW FLOW: initiate payment WITHOUT creating order
        const checkoutData = {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product?.price || 0,
          })),
          shippingAddress: formattedShipping,
          selectedShippingOption: null,
          paymentMethod: 'PESAPAL',
        }

        const response = await api.initiateCheckoutPayment(checkoutData)

        // Backend returns {success, redirectUrl, paymentReference, ...}
        const result = response as any
        if (result?.success && result.redirectUrl) {
          clearCart()
          router.replace({
            pathname: '/payment-webview',
            params: { url: result.redirectUrl, paymentReference: result.paymentReference },
          })
        } else {
          throw new Error(result?.error || 'Failed to initiate payment')
        }
      } else {
        // COD / other — create order directly
        const orderData = {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product?.price || 0,
          })),
          shippingAddress: formattedShipping,
          billingAddress: formattedShipping,
          paymentMethod,
          subtotal: totalPrice,
          tax,
          shipping: shippingCost,
          total: orderTotal,
        }

        const order = await api.createOrder(orderData)

        if (!order?.id) {
          throw new Error('Failed to create order. Please try again.')
        }

        clearCart()
        Alert.alert(
          'Order Placed!',
          `Your order has been placed.\n\nOrder #${order.orderNumber || order.id}`,
          [{ text: 'View Orders', onPress: () => router.replace('/(tabs)/orders') }]
        )
      }
    } catch (error: any) {
      console.error('Order error:', error)
      const message =
        error?.response?.data?.error || error.message || 'Failed to place order. Please try again.'
      Alert.alert('Error', message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Feather name="check" size={14} color={Colors.primary} />
            </View>
            <Text style={[styles.progressText, styles.progressTextActive]}>Shipping</Text>
          </View>
          <View style={styles.progressLine}>
            <View style={[styles.progressLineFill, styles.progressLineFillActive]} />
          </View>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Feather name="check" size={14} color={Colors.primary} />
            </View>
            <Text style={[styles.progressText, styles.progressTextActive]}>Payment</Text>
          </View>
          <View style={styles.progressLine}>
            <View style={styles.progressLineFill} />
          </View>
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Feather name="circle" size={10} color="rgba(255,255,255,0.6)" />
            </View>
            <Text style={styles.progressText}>Confirm</Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="map-pin" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Shipping Address</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.firstName}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, firstName: text })
                }
                placeholder="John"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.lastName}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, lastName: text })
                }
                placeholder="Doe"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.address1}
              onChangeText={(text) =>
                setShippingAddress({ ...shippingAddress, address1: text })
              }
              placeholder="Street address"
              placeholderTextColor={Colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apartment, suite, etc. (optional)</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.address2}
              onChangeText={(text) =>
                setShippingAddress({ ...shippingAddress, address2: text })
              }
              placeholder="Apt 4B"
              placeholderTextColor={Colors.text.muted}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.city}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, city: text })
                }
                placeholder="Nairobi"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>County</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.state}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, state: text })
                }
                placeholder="Nairobi"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
          </View>


          <TouchableOpacity
            style={[styles.locationButton]}
            onPress={async () => {
              try {
                // Request permission
                const { status } = await Location.requestForegroundPermissionsAsync()
                if (status !== 'granted') {
                  Alert.alert('Location Permission', 'Location access is needed to auto-fill your address')
                  return
                }

                // Get current position with timeout and lower accuracy for better success
                const { coords } = await Location.getCurrentPositionAsync({
                  accuracy: Location.Accuracy.Balanced,
                })

                // Reverse geocode
                const response = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&addressdetails=1`,
                  {
                    headers: {
                      'User-Agent': 'EnkajiTrade/1.0 (support@enkaji.co.ke)'
                    }
                  }
                )
                
                if (!response.ok) {
                  throw new Error(`Geocoding failed: ${response.status}`)
                }
                
                const data: any = await response.json()

                  if (data.address) {
                    const addr = data.address

                    // Extract street address
                    const street = addr.road || addr.pedestrian || addr.footway || addr.living_street || ''
                    const addressLine1 = street || data.display_name?.split(',')[0] || ''

                    // Extract city/town
                    const city = addr.city || addr.town || addr.municipality || addr.village || ''

                    // Extract county/state
                    const state = addr.county || addr.state || addr.province || ''

                    // Extract postal code
                    const postalCode = addr.postcode || ''

                    // Extract country
                    const country = addr.country || 'Kenya'

                    // Update state with all fields
                    setShippingAddress({
                      ...shippingAddress,
                      address1: addressLine1,
                      city,
                      state,
                      postalCode,
                      country,
                    })

                    Alert.alert('Success', 'Address auto-filled from your current location')
                } else {
                  Alert.alert('Location Found', data.display_name || 'Address details not available')
                }
              } catch (error: any) {
                console.error('Location error:', error)
                let errorMessage = 'Could not get current location. Please try again.'
                
                if (error.message?.includes('Network')) {
                  errorMessage = 'No internet connection. Please check your network settings.'
                } else if (error.message?.includes('timeout')) {
                  errorMessage = 'Location request timed out. Please check that GPS is enabled.'
                } else if (error.message?.includes('denied')) {
                  errorMessage = 'Location permission was denied. Please enable it in settings.'
                }
                
                Alert.alert('Error', errorMessage)
              }
            }}
          >
            <Feather name="map-pin" size={20} color={Colors.primary} />
            <Text style={styles.locationButtonText}>Use Current Location</Text>
          </TouchableOpacity>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.postalCode}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, postalCode: text })
                }
                placeholder="00100"
                placeholderTextColor={Colors.text.muted}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Phone *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.phone}
                onChangeText={(text) =>
                  setShippingAddress({ ...shippingAddress, phone: text })
                }
                placeholder="0700000000"
                placeholderTextColor={Colors.text.muted}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>


        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="credit-card" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={[styles.paymentOption, styles.paymentOptionSelected]}>
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.paymentIconContainer, styles.paymentIconContainerActive]}>
                <Feather name="smartphone" size={22} color={Colors.text.white} />
              </View>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>M-Pesa / Card</Text>
                <Text style={styles.paymentOptionDesc}>Pay securely via Pesapal</Text>
              </View>
            </View>
            <View style={[styles.radio, styles.radioSelected]}>
              <View style={styles.radioInner} />
            </View>
          </View>

          <View style={styles.paymentInfoBox}>
            <Feather name="info" size={16} color={Colors.primary} />
            <Text style={styles.paymentInfoText}>
              You'll be redirected to Pesapal to complete your payment securely.
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="shopping-bag" size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          {items.map((item) => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.product?.name || 'Product'} x{item.quantity}
              </Text>
              <Text style={styles.summaryItemPrice}>
                KES {((item.product?.price || 0) * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>KES {totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            {shippingLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.summaryValue, shippingCost === 0 && styles.freeShipping]}>
                {shippingCost === 0 ? 'Free' : `KES ${shippingCost.toLocaleString()}`}
              </Text>
            )}
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (16%)</Text>
            <Text style={styles.summaryValue}>KES {tax.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>KES {orderTotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By placing this order, you agree to our Terms of Service
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.bottomTotalLabel}>Total</Text>
          <Text style={styles.bottomTotalValue}>KES {orderTotal.toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={Colors.text.white} />
          ) : (
            <>
              <Feather name="lock" size={18} color={Colors.text.white} />
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  locationButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.white,
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: Colors.primary,
    paddingBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleActive: {
    backgroundColor: Colors.text.white,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
    fontWeight: '500',
  },
  progressTextActive: {
    color: Colors.text.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  progressLineFill: {
    height: '100%',
    backgroundColor: 'transparent',
  },
  progressLineFillActive: {
    backgroundColor: Colors.text.white,
  },
  section: {
    backgroundColor: Colors.background,
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconContainerActive: {
    backgroundColor: Colors.primary,
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  paymentOptionDesc: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    marginRight: 10,
  },
  summaryItemPrice: {
    fontSize: 14,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
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
  freeShipping: {
    color: Colors.success,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 14,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 100,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  totalContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  bottomTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  placeOrderButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderButtonDisabled: {
    opacity: 0.7,
  },
  placeOrderButtonText: {
    color: Colors.text.white,
    fontSize: 17,
    fontWeight: '700',
  },
  paymentInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  paymentInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
})
