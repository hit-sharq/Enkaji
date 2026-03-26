import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const BUSINESS_TYPES = ['Retail', 'Wholesale', 'Manufacturing', 'Service', 'Artisan', 'Agriculture', 'Technology', 'Other']

export default function BecomeSellerScreen() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    businessType: '',
    location: '',
    phoneNumber: '',
    description: '',
    website: '',
  })
  const [selectedType, setSelectedType] = useState('')

  if (user?.role === 'SELLER' || user?.role === 'ADMIN') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Become a Seller</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.alreadySeller}>
          <Feather name="check-circle" size={60} color={Colors.success} />
          <Text style={styles.alreadyTitle}>You are already a seller!</Text>
          <Text style={styles.alreadySubtitle}>Go to your seller dashboard to manage your products and orders.</Text>
          <TouchableOpacity style={styles.dashboardBtn} onPress={() => router.push('/seller/dashboard')}>
            <Text style={styles.dashboardBtnText}>Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handleSubmit = async () => {
    if (!form.businessName.trim()) return Alert.alert('Error', 'Business name is required')
    if (!selectedType) return Alert.alert('Error', 'Please select a business type')
    if (!form.location.trim()) return Alert.alert('Error', 'Location is required')
    if (!form.phoneNumber.trim()) return Alert.alert('Error', 'Phone number is required')

    setIsLoading(true)
    try {
      const data = await api.registerSeller({
        businessName: form.businessName.trim(),
        businessType: selectedType,
        location: form.location.trim(),
        phoneNumber: form.phoneNumber.trim(),
        description: form.description.trim(),
        website: form.website.trim(),
        plan: 'BASIC',
      })

      if (data?.success) {
        if (user) setUser({ ...user, role: 'SELLER' })
        Alert.alert(
          'Success!',
          'Your seller account has been created. You can now start listing products.',
          [{ text: 'Go to Dashboard', onPress: () => router.replace('/seller/dashboard') }]
        )
      } else {
        Alert.alert('Error', data?.error || 'Failed to create seller account')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to register as seller. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Become a Seller</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.banner}>
            <Feather name="shopping-bag" size={32} color={Colors.primary} />
            <Text style={styles.bannerTitle}>Start Selling on Enkaji</Text>
            <Text style={styles.bannerText}>Reach thousands of buyers across Kenya. It's free to get started.</Text>
          </View>

          <Text style={styles.label}>Business Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mwangi Electronics"
            value={form.businessName}
            onChangeText={(t) => setForm({ ...form, businessName: t })}
            placeholderTextColor={Colors.text.tertiary}
          />

          <Text style={styles.label}>Business Type *</Text>
          <View style={styles.typeGrid}>
            {BUSINESS_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.typeChip, selectedType === type && styles.typeChipActive]}
                onPress={() => setSelectedType(type)}
              >
                <Text style={[styles.typeChipText, selectedType === type && styles.typeChipTextActive]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location / County *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Nairobi, Westlands"
            value={form.location}
            onChangeText={(t) => setForm({ ...form, location: t })}
            placeholderTextColor={Colors.text.tertiary}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0712345678"
            value={form.phoneNumber}
            onChangeText={(t) => setForm({ ...form, phoneNumber: t })}
            keyboardType="phone-pad"
            placeholderTextColor={Colors.text.tertiary}
          />

          <Text style={styles.label}>Business Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe what you sell..."
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            multiline
            numberOfLines={4}
            placeholderTextColor={Colors.text.tertiary}
          />

          <Text style={styles.label}>Website (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://yourwebsite.com"
            value={form.website}
            onChangeText={(t) => setForm({ ...form, website: t })}
            keyboardType="url"
            autoCapitalize="none"
            placeholderTextColor={Colors.text.tertiary}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Create Seller Account</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.terms}>
            By registering, you agree to Enkaji's Seller Terms and Conditions.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  form: { padding: 16, paddingBottom: 40 },
  banner: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  bannerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  bannerText: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, marginBottom: 6, marginTop: 16 },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipText: { fontSize: 13, color: Colors.text.secondary },
  typeChipTextActive: { color: '#fff', fontWeight: '600' },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { textAlign: 'center', color: Colors.text.tertiary, fontSize: 12, marginTop: 16 },
  alreadySeller: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  alreadyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  alreadySubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
  dashboardBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dashboardBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  success: {},
})
