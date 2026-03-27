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
import { useDeliveryStore } from '@/lib/store'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', border: '#e0e0e0' }

const BASE_FEE = 150
const PER_KM_FEE = 20

function estimatePrice(distanceKm: number) {
  const distance = Math.max(0, distanceKm - 2)
  const hour = new Date().getHours()
  const isPeak = [12, 13, 17, 18, 19].includes(hour)
  const peakSurcharge = isPeak ? BASE_FEE * 0.5 : 0
  return Math.round(BASE_FEE + distance * PER_KM_FEE + peakSurcharge)
}

export default function RequestDeliveryScreen() {
  const router = useRouter()
  const { addDelivery } = useDeliveryStore()

  const [form, setForm] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    itemDescription: '',
    itemWeightKg: '',
    itemValue: '',
    specialHandling: '',
    paymentMethod: 'mpesa',
    estimatedDistanceKm: 5,
  })
  const [loading, setLoading] = useState(false)

  const estimatedPrice = estimatePrice(form.estimatedDistanceKm)

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async () => {
    if (!form.pickupAddress.trim() || !form.dropoffAddress.trim() || !form.itemDescription.trim()) {
      Alert.alert('Missing Info', 'Please fill in pickup address, dropoff address, and item description.')
      return
    }

    setLoading(true)
    try {
      const result = await api.createDelivery({
        pickupAddress: form.pickupAddress,
        pickupLat: -1.286389,
        pickupLng: 36.817223,
        dropoffAddress: form.dropoffAddress,
        dropoffLat: -1.3,
        dropoffLng: 36.83,
        itemDescription: form.itemDescription,
        itemWeightKg: form.itemWeightKg ? parseFloat(form.itemWeightKg) : undefined,
        itemValue: form.itemValue ? parseFloat(form.itemValue) : undefined,
        specialHandling: form.specialHandling || undefined,
        paymentMethod: form.paymentMethod,
      })

      if (result.success) {
        addDelivery(result.data)
        Alert.alert('Success!', 'Your delivery request has been placed. A driver will be assigned shortly.', [
          { text: 'Track Delivery', onPress: () => router.replace(`/customer/${result.data.id}`) },
        ])
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to place request. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request Delivery</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Pickup Location</Text>
            <View style={styles.inputRow}>
              <Feather name="map-pin" size={18} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Tom Mboya St, Nairobi CBD"
                value={form.pickupAddress}
                onChangeText={(v) => update('pickupAddress', v)}
                placeholderTextColor="#aaa"
              />
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Dropoff Location</Text>
            <View style={styles.inputRow}>
              <Feather name="navigation" size={18} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Westlands, Nairobi"
                value={form.dropoffAddress}
                onChangeText={(v) => update('dropoffAddress', v)}
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Item Details</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What are you sending? (e.g. 2 cartons of fruit, a laptop bag)"
              value={form.itemDescription}
              onChangeText={(v) => update('itemDescription', v)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#aaa"
            />

            <View style={styles.row}>
              <View style={[styles.inputRow, { flex: 1, marginRight: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Weight (kg)"
                  value={form.itemWeightKg}
                  onChangeText={(v) => update('itemWeightKg', v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#aaa"
                />
              </View>
              <View style={[styles.inputRow, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Value (KES)"
                  value={form.itemValue}
                  onChangeText={(v) => update('itemValue', v)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#aaa"
                />
              </View>
            </View>

            <TextInput
              style={[styles.textArea, { marginTop: 12 }]}
              placeholder="Special handling notes (optional)"
              value={form.specialHandling}
              onChangeText={(v) => update('specialHandling', v)}
              multiline
              numberOfLines={2}
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              {['mpesa', 'card', 'cash'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[styles.paymentOption, form.paymentMethod === method && styles.paymentOptionActive]}
                  onPress={() => update('paymentMethod', method)}
                >
                  <Text style={[styles.paymentOptionText, form.paymentMethod === method && styles.paymentOptionTextActive]}>
                    {method === 'mpesa' ? 'M-Pesa' : method === 'card' ? 'Card' : 'Cash'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base fee</Text>
              <Text style={styles.priceValue}>KES {BASE_FEE}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Distance fee (~{form.estimatedDistanceKm} km)</Text>
              <Text style={styles.priceValue}>KES {Math.max(0, (form.estimatedDistanceKm - 2) * PER_KM_FEE)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Total</Text>
              <Text style={styles.totalValue}>KES {estimatedPrice.toLocaleString()}</Text>
            </View>
            <Text style={styles.priceNote}>* Final price calculated based on actual distance</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="send" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Request Delivery</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, minHeight: 46, backgroundColor: '#fafafa' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#000', paddingVertical: 8 },
  textArea: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, padding: 12, fontSize: 14, color: '#000', backgroundColor: '#fafafa', minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginTop: 12 },
  paymentOptions: { flexDirection: 'row', gap: 10 },
  paymentOption: { flex: 1, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  paymentOptionText: { fontSize: 13, fontWeight: '600', color: '#666' },
  paymentOptionTextActive: { color: COLORS.primary },
  priceCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 10 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  priceLabel: { fontSize: 13, color: '#666' },
  priceValue: { fontSize: 13, color: '#000', fontWeight: '600' },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10, marginTop: 2 },
  totalLabel: { fontSize: 15, fontWeight: '800', color: '#000' },
  totalValue: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  priceNote: { fontSize: 11, color: '#aaa', fontStyle: 'italic' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
