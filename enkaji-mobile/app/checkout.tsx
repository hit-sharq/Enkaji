import { useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '@/lib/store'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, totalItems, totalPrice, clearCart } = useCartStore()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('pesapal')
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
  })

  const handlePlaceOrder = async () => {
    if (!shippingAddress.firstName || !shippingAddress.lastName || 
        !shippingAddress.address1 || !shippingAddress.city || 
        !shippingAddress.phone) {
      Alert.alert('Error', 'Please fill in all required shipping details')
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      }

      const response = await api.createOrder(orderData)
      
      if (response.success) {
        clearCart()
        Alert.alert(
          'Order Placed!',
          'Your order has been placed successfully. You will receive a confirmation shortly.',
          [
            {
              text: 'View Orders',
              onPress: () => router.replace('/orders'),
            },
          ]
        )
      }
    } catch (error) {
      console.error('Order error:', error)
      Alert.alert('Error', 'Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const shippingCost = totalPrice > 5000 ? 0 : 500
  const tax = Math.round(totalPrice * 0.16)
  const orderTotal = totalPrice + shippingCost + tax

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
              <Feather name="check" size={14} color={Colors.text.white} />
            </View>
            <Text style={[styles.progressText, styles.progressTextActive]}>Shipping</Text>
          </View>
          <View style={styles.progressLine}>
            <View style={[styles.progressLineFill, styles.progressLineFillActive]} />
          </View>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Feather name="check" size={14} color={Colors.text.white} />
            </View>
            <Text style={[styles.progressText, styles.progressTextActive]}>Payment</Text>
          </View>
          <View style={styles.progressLine}>
            <View style={styles.progressLineFill} />
          </View>
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Feather name="check" size={14} color={Colors.text.white} />
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
                onChangeText={(text) => setShippingAddress({...shippingAddress, firstName: text})}
                placeholder="John"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Last Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.lastName}
                onChangeText={(text) => setShippingAddress({...shippingAddress, lastName: text})}
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
              onChangeText={(text) => setShippingAddress({...shippingAddress, address1: text})}
              placeholder="Street address"
              placeholderTextColor={Colors.text.muted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apartment, suite, etc. (optional)</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.address2}
              onChangeText={(text) => setShippingAddress({...shippingAddress, address2: text})}
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
                onChangeText={(text) => setShippingAddress({...shippingAddress, city: text})}
                placeholder="Nairobi"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.label}>State/County</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.state}
                onChangeText={(text) => setShippingAddress({...shippingAddress, state: text})}
                placeholder="Nairobi"
                placeholderTextColor={Colors.text.muted}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.postalCode}
                onChangeText={(text) => setShippingAddress({...shippingAddress, postalCode: text})}
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
                onChangeText={(text) => setShippingAddress({...shippingAddress, phone: text})}
                placeholder="254700000000"
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
          
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'pesapal' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('pesapal')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.paymentIconContainer, paymentMethod === 'pesapal' && styles.paymentIconContainerActive]}>
                <Feather name="smartphone" size={22} color={paymentMethod === 'pesapal' ? Colors.text.white : Colors.text.primary} />
              </View>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>M-Pesa / Card</Text>
                <Text style={styles.paymentOptionDesc}>Pay securely via Pesapal</Text>
              </View>
            </View>
            <View style={[styles.radio, paymentMethod === 'pesapal' && styles.radioSelected]}>
              {paymentMethod === 'pesapal' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'bank' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('bank')}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.paymentIconContainer, paymentMethod === 'bank' && styles.paymentIconContainerActive]}>
                <Feather name="briefcase" size={22} color={paymentMethod === 'bank' ? Colors.text.white : Colors.text.primary} />
              </View>
              <View style={styles.paymentOptionText}>
                <Text style={styles.paymentOptionTitle}>Bank Transfer</Text>
                <Text style={styles.paymentOptionDesc}>Pay directly to our bank account</Text>
              </View>
            </View>
            <View style={[styles.radio, paymentMethod === 'bank' && styles.radioSelected]}>
              {paymentMethod === 'bank' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
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
            <Text style={[styles.summaryValue, shippingCost === 0 && styles.freeShipping]}>
              {shippingCost === 0 ? 'Free' : `KES ${shippingCost.toLocaleString()}`}
            </Text>
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
  },
  halfInput: {
    width: '48%',
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
    marginLeft: 8,
  },
})

