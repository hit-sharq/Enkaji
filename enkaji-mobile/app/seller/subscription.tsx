import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Colors } from '@/lib/theme'
import api from '@/lib/api'

interface SubscriptionPlan {
  name: string
  price: number
  features: string[]
  maxProducts: number
}

interface Subscription {
  id: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
}

export default function SubscriptionScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [plans, setPlans] = useState<{ [key: string]: SubscriptionPlan }>({})
  const [productCount, setProductCount] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await api.getSubscription()
      if (response) {
        setSubscription(response.subscription)
        setPlans(response.plans || {})
        setProductCount(response.productCount || 0)
      }
    } catch (error: any) {
      console.error('Error loading subscription:', error)
      // Use default plans if API fails
      setPlans({
        BASIC: { name: 'Basic Seller', price: 0, features: ['Up to 20 products', 'Basic analytics', 'Standard support'], maxProducts: 20 },
        PREMIUM: { name: 'Premium Seller', price: 1500, features: ['Unlimited products', 'Featured listings', 'Priority support', 'Bulk upload'], maxProducts: -1 },
        ENTERPRISE: { name: 'Enterprise Seller', price: 5000, features: ['Everything in Premium', 'Dedicated manager', 'API access', 'Custom integrations'], maxProducts: -1 },
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (planType: string) => {
    const plan = plans[planType]
    if (!plan) return

    if (plan.price === 0) {
      // Free plan - activate immediately
      setSubscribing(true)
      try {
        const response = await api.updateSubscription({ planType })
        Alert.alert('Success', 'Subscription activated!')
        fetchSubscription()
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Failed to activate subscription')
      } finally {
        setSubscribing(false)
      }
    } else {
      // Paid plan - show payment form
      setSelectedPlan(planType)
    }
  }

  const handlePayment = async () => {
    if (!selectedPlan || !phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number')
      return
    }

    setSubscribing(true)
    try {
      const response = await api.updateSubscription({ planType: selectedPlan, phoneNumber })
      
      Alert.alert('Payment Initiated', 'Please complete payment on your phone.')

      if (response.redirectUrl) {
        router.push({ pathname: '/payment-webview', params: { url: response.redirectUrl } })
      } else {
        fetchSubscription()
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to initiate payment')
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    )
  }

  const currentPlan = subscription?.plan || 'BASIC'
  const isActive = subscription?.status === 'ACTIVE'

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Subscription Status */}
        {subscription && (
          <View style={styles.currentPlanCard}>
            <View style={styles.currentPlanHeader}>
              <Feather name="credit-card" size={20} color={Colors.primary} />
              <Text style={styles.currentPlanTitle}>Current Plan</Text>
            </View>
            <View style={styles.currentPlanContent}>
              <View>
                <Text style={styles.currentPlanName}>{plans[currentPlan]?.name}</Text>
                <Text style={[styles.currentPlanStatus, isActive ? styles.statusActive : styles.statusInactive]}>
                  {isActive ? 'Active' : subscription.status}
                </Text>
                {subscription.currentPeriodEnd && (
                  <Text style={styles.renewalText}>
                    Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <View style={styles.currentPlanPrice}>
                <Text style={styles.priceText}>
                  {plans[currentPlan]?.price === 0 ? 'Free' : `KES ${plans[currentPlan]?.price}`}
                </Text>
                {plans[currentPlan]?.price > 0 && <Text style={styles.periodText}>/mo</Text>}
              </View>
            </View>
            <View style={styles.productCountRow}>
              <Feather name="package" size={16} color={Colors.text.secondary} />
              <Text style={styles.productCountText}>
                {productCount} / {plans[currentPlan]?.maxProducts === -1 ? '∞' : plans[currentPlan]?.maxProducts} products
              </Text>
            </View>
          </View>
        )}

        {/* Plans */}
        <Text style={styles.sectionTitle}>Available Plans</Text>
        
        {Object.entries(plans).map(([planType, plan]) => {
          const isCurrent = currentPlan === planType && isActive
          
          return (
            <TouchableOpacity
              key={planType}
              style={[styles.planCard, isCurrent && styles.planCardCurrent]}
              onPress={() => handleSubscribe(planType)}
              disabled={isCurrent || subscribing}
            >
              <View style={styles.planHeader}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>
                      {plan.price === 0 ? 'Free' : `KES ${plan.price}`}
                    </Text>
                    {plan.price > 0 && <Text style={styles.planPeriod}>/month</Text>}
                  </View>
                </View>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>

              <View style={styles.featuresList}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Feather name="check" size={14} color={Colors.success} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.subscribeButton,
                  isCurrent && styles.subscribeButtonDisabled,
                ]}
                onPress={() => handleSubscribe(planType)}
                disabled={isCurrent || subscribing}
              >
                <Text style={styles.subscribeButtonText}>
                  {isCurrent ? 'Current Plan' : plan.price === 0 ? 'Activate Free' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )
        })}

        {/* Payment Form for Paid Plans */}
        {selectedPlan && plans[selectedPlan] && plans[selectedPlan].price > 0 && (
          <View style={styles.paymentForm}>
            <Text style={styles.paymentFormTitle}>Complete Payment</Text>
            <Text style={styles.paymentFormDesc}>
              Enter your phone number to receive M-Pesa payment request
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Feather name="phone" size={18} color={Colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="e.g., 0712345678"
                  placeholderTextColor={Colors.text.muted}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.paymentFormButtons}>
              <TouchableOpacity
                style={styles.payButton}
                onPress={handlePayment}
                disabled={subscribing}
              >
                {subscribing ? (
                  <ActivityIndicator size="small" color={Colors.text.white} />
                ) : (
                  <Text style={styles.payButtonText}>Pay KES {plans[selectedPlan]?.price}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setSelectedPlan(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginTop: 12,
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.white,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  currentPlanCard: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  currentPlanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  currentPlanContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  currentPlanName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  currentPlanStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  statusActive: {
    color: Colors.success,
  },
  statusInactive: {
    color: Colors.error,
  },
  renewalText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  currentPlanPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  periodText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  productCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  productCountText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardCurrent: {
    borderColor: Colors.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginLeft: 2,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  subscribeButtonDisabled: {
    backgroundColor: Colors.text.muted,
  },
  subscribeButtonText: {
    color: Colors.text.white,
    fontSize: 15,
    fontWeight: '700',
  },
  paymentForm: {
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentFormTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  paymentFormDesc: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  paymentFormButtons: {
    gap: 12,
  },
  payButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
})