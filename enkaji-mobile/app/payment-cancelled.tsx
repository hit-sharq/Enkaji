import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PaymentCancelledScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cancel Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.cancelIcon}>
            <MaterialCommunityIcons
              name="close-circle"
              size={80}
              color="#e74c3c"
            />
          </View>
        </View>

        {/* Cancel Message */}
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.subtitle}>
          Your payment was not completed. Your cart items are still saved, so you can complete your purchase anytime.
        </Text>

        {/* Why This Happened */}
        <View style={styles.reasonBox}>
          <MaterialCommunityIcons name="alert" size={20} color="#f39c12" />
          <View style={styles.reasonContent}>
            <Text style={styles.reasonTitle}>What Happened?</Text>
            <Text style={styles.reasonText}>
              The payment process was cancelled before completion. No charges have been made to your account.
            </Text>
          </View>
        </View>

        {/* Next Steps */}
        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>Next Steps:</Text>
          <Step
            number="1"
            title="Return to Your Cart"
            description="All items remain in your cart"
          />
          <Step
            number="2"
            title="Review Your Order"
            description="Check quantities and details"
          />
          <Step
            number="3"
            title="Try Again"
            description="Proceed to checkout and choose another payment method"
          />
        </View>

        {/* Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Payment Tips:</Text>
          <Tip
            icon="credit-card"
            text="Ensure your payment details are correct"
          />
          <Tip
            icon="wifi"
            text="Check your internet connection"
          />
          <Tip
            icon="phone"
            text="Try a different payment method"
          />
          <Tip
            icon="headset"
            text="Contact support if issues persist"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/(tabs)/cart')}
        >
          <Text style={styles.primaryButtonText}>Back to Cart</Text>
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

function Step({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
      </View>
    </View>
  )
}

function Tip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tipItem}>
      <MaterialCommunityIcons name={icon as any} size={16} color="#3498db" />
      <Text style={styles.tipText}>{text}</Text>
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
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  cancelIcon: {
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
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 12,
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 12,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  stepsBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
  },
  stepDescription: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  tipsBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#7f8c8d',
    flex: 1,
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
    backgroundColor: '#3498db',
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
