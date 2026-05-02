import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '@/lib/theme'

export default function PaymentMethodSelectionScreen() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState(null)

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: 'credit-card',
      color: '#e74c3c',
      description: 'Visa, Mastercard, American Express'
    },
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: 'phone',
      color: '#27ae60',
      description: 'Safaricom Mobile Money'
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: 'phone',
      color: '#f39c12',
      description: 'Airtel Mobile Money'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: 'bank',
      color: '#3498db',
      description: 'Equity, KCB, Co-op Bank'
    }
  ]

  const handleSelectMethod = (method) => {
    setSelectedMethod(method.id)
    // Navigate to appropriate payment flow based on method
    switch (method.id) {
      case 'card':
        // For now, redirect to webview with method parameter
        // In future, could implement native Stripe integration
        router.push({
          pathname: '/(tabs)/checkout',
          params: { paymentMethod: 'card' }
        })
        break
      case 'mpesa':
        router.push({
          pathname: '/(tabs)/checkout',
          params: { paymentMethod: 'mpesa' }
        })
        break
      case 'airtel':
        router.push({
          pathname: '/(tabs)/checkout',
          params: { paymentMethod: 'airtel' }
        })
        break
      case 'bank':
        router.push({
          pathname: '/(tabs)/checkout',
          params: { paymentMethod: 'bank' }
        })
        break
      default:
        router.push('/(tabs)/checkout')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="lock" size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Select Payment Method</Text>
      </View>

      <View style={methodsContainer}>
        {paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.methodCard,
              selectedMethod === method.id && styles.selectedMethodCard
            ]}
            onPress={() => handleSelectMethod(method)}
          >
            <View style={styles.methodIconContainer}>
              <MaterialCommunityIcons
                name={method.icon}
                size={28}
                color={method.color}
              />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>{method.name}</Text>
              <Text style={styles.methodDescription}>{method.description}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={selectedMethod === method.id ? method.color : Colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected method confirmation */}
      {selectedMethod && (
        <View style={styles.confirmationContainer}>
          <View style={styles.confirmationIcon}>
            <MaterialCommunityIcons name="check-circle" size={24} color={Colors.success} />
          </View>
          <Text style={styles.confirmationText}>
            Selected: {paymentMethods.find(m => m.id === selectedMethod).name}
          </Text>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => {
              // Proceed to checkout with selected method
              router.push({
                pathname: '/(tabs)/checkout',
                params: { paymentMethod: selectedMethod }
              })
            }}
          >
            <Text style={styles.confirmButtonText}>Proceed to Payment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  methodsContainer: {
    padding: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedMethodCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05', // 5% opacity
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  confirmationContainer: {
    margin: 24,
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmationIcon: {
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  confirmButtonText: {
    color: Colors.text.white,
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
})