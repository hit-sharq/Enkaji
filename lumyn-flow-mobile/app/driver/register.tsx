import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import api from '@/lib/api'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', border: '#e0e0e0' }

const VEHICLE_TYPES = ['motorcycle', 'bicycle', 'car', 'van', 'truck']

export default function DriverRegisterScreen() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    vehicleType: 'motorcycle',
    vehicleRegistration: '',
    licenseNumber: '',
    idNumber: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankCode: '',
  })

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleNext = () => {
    if (step === 1) {
      if (!form.fullName.trim() || !form.phoneNumber.trim()) {
        Alert.alert('Missing Fields', 'Please enter your full name and phone number.')
        return
      }
    }
    if (step === 2) {
      if (!form.idNumber.trim() || !form.licenseNumber.trim()) {
        Alert.alert('Missing Fields', 'Please enter your ID number and license number.')
        return
      }
    }
    setStep((s) => s + 1)
  }

  const handleSubmit = async () => {
    if (!form.bankAccountNumber.trim() || !form.bankAccountName.trim()) {
      Alert.alert('Missing Fields', 'Please enter your bank account details for payouts.')
      return
    }
    setLoading(true)
    try {
      const result = await api.registerDriver({
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email || undefined,
        vehicleType: form.vehicleType,
        vehicleRegistration: form.vehicleRegistration || undefined,
        licenseNumber: form.licenseNumber,
        idNumber: form.idNumber,
        bankAccountName: form.bankAccountName,
        bankAccountNumber: form.bankAccountNumber,
        bankCode: form.bankCode || undefined,
      })
      if (result.success) {
        Alert.alert(
          'Registration Submitted! 🎉',
          'Your application is under review. Our team will verify your documents and activate your account within 24 hours.',
          [{ text: 'OK', onPress: () => router.replace('/driver/home') }]
        )
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          {step > 1 ? (
            <TouchableOpacity onPress={() => setStep((s) => s - 1)}>
              <Feather name="arrow-left" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="x" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Driver Registration</Text>
          <Text style={styles.stepCount}>{step}/3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && (
            <>
              <View style={styles.stepHeader}>
                <Feather name="user" size={32} color={COLORS.primary} />
                <Text style={styles.stepTitle}>Personal Info</Text>
                <Text style={styles.stepSubtitle}>Tell us about yourself</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="As on your ID"
                  value={form.fullName}
                  onChangeText={(v) => update('fullName', v)}
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0712 345 678"
                  value={form.phoneNumber}
                  onChangeText={(v) => update('phoneNumber', v)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Email (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  value={form.email}
                  onChangeText={(v) => update('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Vehicle Type *</Text>
                <View style={styles.vehicleGrid}>
                  {VEHICLE_TYPES.map((v) => (
                    <TouchableOpacity
                      key={v}
                      style={[styles.vehicleBtn, form.vehicleType === v && styles.vehicleBtnActive]}
                      onPress={() => update('vehicleType', v)}
                    >
                      <Text style={[styles.vehicleBtnText, form.vehicleType === v && styles.vehicleBtnTextActive]}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.stepHeader}>
                <Feather name="shield" size={32} color={COLORS.primary} />
                <Text style={styles.stepTitle}>KYC Verification</Text>
                <Text style={styles.stepSubtitle}>Required for driver approval</Text>
              </View>

              <View style={styles.kycNotice}>
                <Feather name="info" size={14} color="#3b82f6" />
                <Text style={styles.kycNoticeText}>Your documents will be verified by our team within 24 hours before you can accept jobs.</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>National ID Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 12345678"
                  value={form.idNumber}
                  onChangeText={(v) => update('idNumber', v)}
                  keyboardType="number-pad"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Driver's License Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. A12345678"
                  value={form.licenseNumber}
                  onChangeText={(v) => update('licenseNumber', v)}
                  autoCapitalize="characters"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Vehicle Registration (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. KBD 123A"
                  value={form.vehicleRegistration}
                  onChangeText={(v) => update('vehicleRegistration', v)}
                  autoCapitalize="characters"
                  placeholderTextColor="#aaa"
                />
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.stepHeader}>
                <Feather name="credit-card" size={32} color={COLORS.primary} />
                <Text style={styles.stepTitle}>Payout Details</Text>
                <Text style={styles.stepSubtitle}>Where we send your earnings</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.label}>Account Holder Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name as registered with bank"
                  value={form.bankAccountName}
                  onChangeText={(v) => update('bankAccountName', v)}
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Bank Account Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 0123456789"
                  value={form.bankAccountNumber}
                  onChangeText={(v) => update('bankAccountNumber', v)}
                  keyboardType="number-pad"
                  placeholderTextColor="#aaa"
                />

                <Text style={styles.label}>Bank Code (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 01 for KCB"
                  value={form.bankCode}
                  onChangeText={(v) => update('bankCode', v)}
                  keyboardType="number-pad"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Registration Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Name</Text>
                  <Text style={styles.summaryVal}>{form.fullName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Phone</Text>
                  <Text style={styles.summaryVal}>{form.phoneNumber}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>Vehicle</Text>
                  <Text style={styles.summaryVal}>{form.vehicleType}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryKey}>ID</Text>
                  <Text style={styles.summaryVal}>••••{form.idNumber.slice(-4)}</Text>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={step < 3 ? handleNext : handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnText}>{step < 3 ? 'Continue' : 'Submit Registration'}</Text>
                <Feather name={step < 3 ? 'arrow-right' : 'check'} size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  stepCount: { fontSize: 13, color: '#888', fontWeight: '600' },
  progressBar: { height: 3, backgroundColor: '#eee' },
  progressFill: { height: 3, backgroundColor: COLORS.primary, borderRadius: 2 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  stepHeader: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: '#000' },
  stepSubtitle: { fontSize: 14, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#444', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#000', backgroundColor: '#fafafa' },
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  vehicleBtn: { borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  vehicleBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  vehicleBtnText: { fontSize: 13, fontWeight: '600', color: '#666' },
  vehicleBtnTextActive: { color: COLORS.primary },
  kycNotice: { flexDirection: 'row', gap: 8, backgroundColor: '#eff6ff', borderRadius: 10, padding: 12 },
  kycNoticeText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 18 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  summaryKey: { fontSize: 13, color: '#888' },
  summaryVal: { fontSize: 13, fontWeight: '600', color: '#000' },
  btn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
