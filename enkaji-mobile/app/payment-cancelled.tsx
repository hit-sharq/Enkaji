import React from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export default function PaymentCancelledScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cancel Illustration */}
        <View style={styles.illustrationContainer}>
          <MaterialCommunityIcons
            name="close-circle-outline"
            size={100}
            color="#e74c3c"
          />
        </View>

        {/* Cancel Message */}
        <Text style={styles.title}>Payment Cancelled</Text>
        <Text style={styles.subtitle}>
          Your payment was not completed. Your cart items are still saved, so you can complete your purchase anytime.
        </Text>

        {/* What Happened */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="alert-circle" size={20} color="#f39c12" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What Happened?</Text>
            <Text style={styles.infoText}>
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

        {/* Helpful Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>Helpful Tips:</Text>
          <Tip
            icon="credit-card"
            text="Double-check your payment details"
          />
          <Tip
            icon="wifi"
            text="Ensure stable internet connection"
          />
          <Tip
            icon="phone-outline"
            text="Try a different payment method if available"
          />
          <Tip
            icon="headset"
            text="Contact support if problems continue"
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, styles.buttonFull]}
          onPress={() => router.replace('/(tabs)/cart')}
        >
          <Text style={styles.buttonText}>Return to Cart</Text>
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
    padding: 20,
    paddingBottom: 100,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
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
    color: '#2c3e50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
  },
  stepsBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
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
    fontSize: 14,
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
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
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
    paddingBottom: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#ecf0f1',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonFull: {
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
})