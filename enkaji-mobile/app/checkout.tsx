import { useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  StyleSheet,
  Alert,
  ActivityIndicator 
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '@/lib/store'
import api from '@/lib/api'

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
    <ScrollView style={styles.container}>
      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        
        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.firstName}
              onChangeText={(text) => setShippingAddress({...shippingAddress, firstName: text})}
              placeholder="John"
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.lastName}
              onChangeText={(text) => setShippingAddress({...shippingAddress, lastName: text})}
              placeholder="Doe"
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
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apartment, suite, etc. (optional)</Text>
          <TextInput
            style={styles.input}
            value={shippingAddress.address2}
            onChangeText={(text) => setShippingAddress({...shippingAddress, address2: text})}
            placeholder="Apt 4B"
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
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>State/County</Text>
            <TextInput
              style={styles.input}
              value={shippingAddress.state}
              onChangeText={(text) => setShippingAddress({...shippingAddress, state: text})}
              placeholder="Nairobi"
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
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        
        <TouchableOpacity 
          style={[styles.paymentOption, paymentMethod === 'pesapal' && styles.paymentOptionSelected]}
          onPress={() => setPaymentMethod('pesapal')}
        >
          <View style={styles.paymentOptionLeft}>
            <Feather name="credit-card" size={24} color="#000" />
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
            <Feather name="briefcase" size={24} color="#000" />
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
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
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

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>KES {totalPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
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

      {/* Place Order Button */}
      <TouchableOpacity 
        style={[styles.placeOrderButton, isProcessing && styles.placeOrderButtonDisabled]}
        onPress={handlePlaceOrder}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.placeOrderButtonText}>
            Place Order - KES {orderTotal.toLocaleString()}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By placing this order, you agree to our Terms of Service
        </Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 10,
  },
  paymentOptionSelected: {
    borderColor: '#000',
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionText: {
    marginLeft: 12,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  paymentOptionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#000',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  summaryItemPrice: {
    fontSize: 14,
    color: '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#000',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeOrderButton: {
    backgroundColor: '#000',
    margin: 15,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
})

