import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const PAYOUT_METHODS = [
  { id: 'MPESA', label: 'M-Pesa', icon: 'smartphone', desc: 'Instant to your M-Pesa number' },
  { id: 'BANK', label: 'Bank Transfer', icon: 'briefcase', desc: '1–3 business days' },
  { id: 'AIRTEL', label: 'Airtel Money', icon: 'phone', desc: 'Instant to Airtel Money' },
]

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING:   { color: '#F59E0B', label: 'Pending' },
  APPROVED:  { color: '#3B82F6', label: 'Approved' },
  COMPLETED: { color: '#10B981', label: 'Completed' },
  REJECTED:  { color: '#EF4444', label: 'Rejected' },
}

export default function SellerPayoutsScreen() {
  const router = useRouter()
  const [payouts, setPayouts] = useState<any[]>([])
  const [stats, setStats] = useState({ available: 0, pending: 0, totalEarned: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('MPESA')
  const [amount, setAmount] = useState('')
  const [isRequesting, setIsRequesting] = useState(false)

  const loadPayouts = useCallback(async () => {
    try {
      const response = await api.getSellerPayouts()
      // Payouts API returns { payouts, availableBalance, pendingBalance, totalEarned }
      if (response && response.payouts) {
        setPayouts(response.payouts)
        setStats({
          available: response.availableBalance || 0,
          pending: response.pendingBalance || 0,
          totalEarned: response.totalEarned || 0,
        })
      } else if (Array.isArray(response)) {
        setPayouts(response)
      }
    } catch (error) {
      console.error('Error loading payouts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadPayouts() }, [loadPayouts])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadPayouts()
    setRefreshing(false)
  }

  const handleRequestPayout = async () => {
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return Alert.alert('Error', 'Please enter a valid amount')
    }
    if (amountNum < 500) {
      return Alert.alert('Error', 'Minimum payout amount is KES 500')
    }
    if (amountNum > stats.available) {
      return Alert.alert('Error', `Available balance is KES ${stats.available.toLocaleString()}`)
    }

    setIsRequesting(true)
    try {
      const response = await api.requestPayout({ amount: amountNum, method: selectedMethod })
      if (response.success) {
        Alert.alert(
          'Payout Requested',
          `Your payout of KES ${amountNum.toLocaleString()} has been submitted and will be processed within 1–3 business days.`
        )
        setShowModal(false)
        setAmount('')
        loadPayouts()
      } else {
        Alert.alert('Error', response.error || 'Failed to request payout')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to request payout. Please try again.')
    } finally {
      setIsRequesting(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading payouts...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}
      >
        {/* Header Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>KES {stats.available.toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.requestBtn, stats.available < 500 && styles.requestBtnDisabled]}
            onPress={() => stats.available >= 500 ? setShowModal(true) : Alert.alert('Minimum Balance', 'You need at least KES 500 to request a payout.')}
          >
            <Feather name="send" size={16} color="#fff" />
            <Text style={styles.requestBtnText}>Request Payout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="clock" size={20} color="#F59E0B" />
            <Text style={styles.statValue}>KES {stats.pending.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Feather name="trending-up" size={20} color="#10B981" />
            <Text style={styles.statValue}>KES {stats.totalEarned.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
        </View>

        {/* Payout History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout History</Text>
          {payouts.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Feather name="inbox" size={40} color={Colors.border} />
              <Text style={styles.emptyHistoryText}>No payouts yet</Text>
              <Text style={styles.emptyHistorySubtext}>Your payout history will appear here</Text>
            </View>
          ) : (
            payouts.map((payout, index) => {
              const status = STATUS_CONFIG[payout.status] ?? { color: '#6B7280', label: payout.status }
              return (
                <View key={payout.id || index} style={styles.payoutCard}>
                  <View style={styles.payoutCardLeft}>
                    <View style={[styles.payoutIconBg, { backgroundColor: status.color + '18' }]}>
                      <Feather name="credit-card" size={20} color={status.color} />
                    </View>
                    <View>
                      <Text style={styles.payoutMethod}>{payout.method || 'M-Pesa'}</Text>
                      <Text style={styles.payoutDate}>
                        {new Date(payout.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.payoutCardRight}>
                    <Text style={styles.payoutAmount}>KES {Number(payout.amount).toLocaleString()}</Text>
                    <View style={[styles.payoutStatusBadge, { backgroundColor: status.color + '18' }]}>
                      <Text style={[styles.payoutStatusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                </View>
              )
            })
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Request Payout Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Request Payout</Text>
            <View style={{ width: 24 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.availableBox}>
                <Text style={styles.availableLabel}>Available Balance</Text>
                <Text style={styles.availableAmount}>KES {stats.available.toLocaleString()}</Text>
              </View>

              <Text style={styles.fieldLabel}>Amount (KES) *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 5000"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor={Colors.text.tertiary}
              />
              <Text style={styles.fieldHint}>Minimum: KES 500</Text>

              <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Payout Method *</Text>
              {PAYOUT_METHODS.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodOption, selectedMethod === method.id && styles.methodOptionActive]}
                  onPress={() => setSelectedMethod(method.id)}
                >
                  <View style={[styles.methodIcon, selectedMethod === method.id && { backgroundColor: Colors.primary }]}>
                    <Feather name={method.icon as any} size={20} color={selectedMethod === method.id ? '#fff' : Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodLabel}>{method.label}</Text>
                    <Text style={styles.methodDesc}>{method.desc}</Text>
                  </View>
                  <View style={[styles.radio, selectedMethod === method.id && styles.radioActive]}>
                    {selectedMethod === method.id && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.submitBtn, isRequesting && { opacity: 0.7 }]}
                onPress={handleRequestPayout}
                disabled={isRequesting}
              >
                {isRequesting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={styles.submitBtnText}>Submit Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundSecondary },
  loadingText: { marginTop: 12, color: Colors.text.tertiary, fontSize: 14 },
  balanceCard: {
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  balanceAmount: { fontSize: 38, fontWeight: '800', color: '#fff', marginBottom: 20 },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  requestBtnDisabled: { opacity: 0.5 },
  requestBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: Colors.text.primary },
  statLabel: { fontSize: 12, color: Colors.text.tertiary, fontWeight: '500' },
  section: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  emptyHistory: { backgroundColor: Colors.background, borderRadius: 14, padding: 40, alignItems: 'center', gap: 10 },
  emptyHistoryText: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  emptyHistorySubtext: { fontSize: 13, color: Colors.text.tertiary, textAlign: 'center' },
  payoutCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  payoutCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payoutIconBg: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  payoutMethod: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, marginBottom: 2 },
  payoutDate: { fontSize: 12, color: Colors.text.tertiary },
  payoutCardRight: { alignItems: 'flex-end', gap: 4 },
  payoutAmount: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  payoutStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  payoutStatusText: { fontSize: 11, fontWeight: '700' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  modalContent: { padding: 20, paddingBottom: 40 },
  availableBox: {
    backgroundColor: Colors.primary + '12',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  availableLabel: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginBottom: 4 },
  availableAmount: { fontSize: 24, fontWeight: '800', color: Colors.primary },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.secondary, marginBottom: 8 },
  fieldHint: { fontSize: 12, color: Colors.text.tertiary, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  methodOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.background },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodLabel: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  methodDesc: { fontSize: 12, color: Colors.text.tertiary, marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.border, justifyContent: 'center', alignItems: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 11, height: 11, borderRadius: 6, backgroundColor: Colors.primary },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
