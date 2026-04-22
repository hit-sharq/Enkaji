import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Category } from '@/types'
import { Colors } from '@/lib/theme'

const PRICE_TYPES = [
  { label: 'Fixed Price', value: 'FIXED' },
  { label: 'Hourly Rate', value: 'HOURLY' },
  { label: 'Starting From', value: 'startingFrom' },
  { label: 'Negotiable', value: 'negotiable' },
]

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 'sunday' },
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
]

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
  '21:00', '21:30', '22:00',
]

export default function AddServiceScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    duration: '60',
    subcategory: '',
    location: '',
    address: '',
    images: '',
    tags: '',
  })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [priceType, setPriceType] = useState('FIXED')
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [showStartTime, setShowStartTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.getServiceCategories()
      if (response.categories) setCategories(response.categories)
      else if (Array.isArray(response)) setCategories(response)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    )
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Service name is required')
    if (!form.description.trim()) return Alert.alert('Error', 'Description is required')
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      return Alert.alert('Error', 'Please enter a valid price')
    }
    if (!form.duration || isNaN(parseInt(form.duration)) || parseInt(form.duration) <= 0) {
      return Alert.alert('Error', 'Please enter a valid duration')
    }
    if (!selectedCategory) return Alert.alert('Error', 'Please select a category')

    setIsLoading(true)
    try {
      const imageList = form.images
        .split('\n')
        .map((url) => url.trim())
        .filter((url) => url.length > 0)

      const tagList = form.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)

      const serviceData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        duration: parseInt(form.duration),
        category: selectedCategory,
        subcategory: form.subcategory.trim() || undefined,
        city: form.location.split(',')[0]?.trim() || undefined,
        county: form.location.split(',')[1]?.trim() || undefined,
        location: form.location.trim() || undefined,
        address: form.address.trim() || undefined,
        images: imageList,
        tags: tagList,
        priceType,
        availableDays: selectedDays.length > 0 ? selectedDays : null,
        startTime: selectedDays.length > 0 ? startTime : null,
        endTime: selectedDays.length > 0 ? endTime : null,
      }

      const response = await api.createService(serviceData)
      if (response.success || response.service) {
        Alert.alert(
          'Service Created!',
          `"${form.name}" has been listed successfully.`,
          [{ text: 'View Services', onPress: () => router.replace('/provider/services' as any) }]
        )
      } else {
        Alert.alert('Error', response.error || 'Failed to create service')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to create service. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCategoryName = categories.find((c) => c.id === selectedCategory)?.name

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Text style={styles.label}>Service Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Home Cleaning Service"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe your service in detail..."
              value={form.description}
              onChangeText={(t) => setForm({ ...form, description: t })}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.text.tertiary}
              textAlignVertical="top"
            />
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Price (KES) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={form.price}
                  onChangeText={(t) => setForm({ ...form, price: t })}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="60"
                  value={form.duration}
                  onChangeText={(t) => setForm({ ...form, duration: t })}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>

            <Text style={styles.label}>Price Type</Text>
            <View style={styles.priceTypeRow}>
              {PRICE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.priceTypeBtn, priceType === type.value && styles.priceTypeBtnActive]}
                  onPress={() => setPriceType(type.value)}
                >
                  <Text style={[styles.priceTypeText, priceType === type.value && styles.priceTypeTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category *</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectorBtn]}
              onPress={() => setShowCategories(!showCategories)}
            >
              <Text style={[styles.selectorText, !selectedCategoryName && { color: Colors.text.tertiary }]}>
                {selectedCategoryName || 'Select a category'}
              </Text>
              <Feather name={showCategories ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text.tertiary} />
            </TouchableOpacity>
            {showCategories && (
              <View style={styles.categoryList}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                    onPress={() => {
                      setSelectedCategory(cat.id)
                      setShowCategories(false)
                    }}
                  >
                    <Text style={[styles.categoryItemText, selectedCategory === cat.id && styles.categoryItemTextActive]}>
                      {cat.name}
                    </Text>
                    {selectedCategory === cat.id && <Feather name="check" size={16} color={Colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.label, { marginTop: 14 }]}>Subcategory</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Deep Cleaning"
              value={form.subcategory}
              onChangeText={(t) => setForm({ ...form, subcategory: t })}
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>

            <Text style={styles.label}>City, County</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Nairobi, Nairobi County"
              value={form.location}
              onChangeText={(t) => setForm({ ...form, location: t })}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Westlands, Nairobi"
              value={form.address}
              onChangeText={(t) => setForm({ ...form, address: t })}
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>

            <Text style={styles.label}>Available Days</Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayBtn, selectedDays.includes(day.value) && styles.dayBtnActive]}
                  onPress={() => toggleDay(day.value)}
                >
                  <Text style={[styles.dayText, selectedDays.includes(day.value) && styles.dayTextActive]}>
                    {day.label.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedDays.length > 0 && (
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Start Time</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.selectorBtn]}
                    onPress={() => setShowStartTime(!showStartTime)}
                  >
                    <Text style={styles.selectorText}>{startTime}</Text>
                    <Feather name="clock" size={18} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                  {showStartTime && (
                    <View style={styles.timeList}>
                      {TIME_OPTIONS.map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[styles.timeItem, startTime === time && styles.timeItemActive]}
                          onPress={() => {
                            setStartTime(time)
                            setShowStartTime(false)
                          }}
                        >
                          <Text style={[styles.timeItemText, startTime === time && styles.timeItemTextActive]}>{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>End Time</Text>
                  <TouchableOpacity
                    style={[styles.input, styles.selectorBtn]}
                    onPress={() => setShowEndTime(!showEndTime)}
                  >
                    <Text style={styles.selectorText}>{endTime}</Text>
                    <Feather name="clock" size={18} color={Colors.text.tertiary} />
                  </TouchableOpacity>
                  {showEndTime && (
                    <View style={styles.timeList}>
                      {TIME_OPTIONS.map((time) => (
                        <TouchableOpacity
                          key={time}
                          style={[styles.timeItem, endTime === time && styles.timeItemActive]}
                          onPress={() => {
                            setEndTime(time)
                            setShowEndTime(false)
                          }}
                        >
                          <Text style={[styles.timeItemText, endTime === time && styles.timeItemTextActive]}>{time}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Images</Text>
            <Text style={styles.hint}>Enter image URLs, one per line</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
              value={form.images}
              onChangeText={(t) => setForm({ ...form, images: t })}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.text.tertiary}
              textAlignVertical="top"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. professional, reliable, affordable"
              value={form.tags}
              onChangeText={(t) => setForm({ ...form, tags: t })}
              placeholderTextColor={Colors.text.tertiary}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="plus-circle" size={18} color="#fff" />
                <Text style={styles.submitBtnText}>Publish Service</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  back: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: 16 },
  section: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, marginBottom: 6, marginTop: 4 },
  hint: { fontSize: 12, color: Colors.text.tertiary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 4,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  priceTypeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  priceTypeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priceTypeBtnActive: { backgroundColor: Colors.primary + '12', borderColor: Colors.primary },
  priceTypeText: { fontSize: 13, color: Colors.text.secondary },
  priceTypeTextActive: { color: Colors.primary, fontWeight: '600' },
  selectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 12,
  },
  selectorText: { fontSize: 14, color: Colors.text.primary },
  categoryList: {
    marginTop: 6,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    maxHeight: 200,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  categoryItemActive: { backgroundColor: Colors.primary + '10' },
  categoryItemText: { fontSize: 14, color: Colors.text.primary },
  categoryItemTextActive: { color: Colors.primary, fontWeight: '700' },
  daysRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  dayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  dayText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  dayTextActive: { color: '#fff' },
  timeList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 200,
    zIndex: 10,
    elevation: 5,
  },
  timeItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.backgroundSecondary },
  timeItemActive: { backgroundColor: Colors.primary + '10' },
  timeItemText: { fontSize: 14, color: Colors.text.primary },
  timeItemTextActive: { color: Colors.primary, fontWeight: '600' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})