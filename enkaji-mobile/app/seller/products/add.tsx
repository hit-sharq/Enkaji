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

export default function AddProductScreen() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    comparePrice: '',
    sku: '',
    inventory: '1',
    images: '',
    categoryId: '',
    tags: '',
    weight: '',
  })
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await api.getCategories()
      if (response.categories) setCategories(response.categories)
      else if (Array.isArray(response)) setCategories(response)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) return Alert.alert('Error', 'Product name is required')
    if (!form.description.trim()) return Alert.alert('Error', 'Description is required')
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      return Alert.alert('Error', 'Please enter a valid price')
    }
    if (!selectedCategory) return Alert.alert('Error', 'Please select a category')
    if (!form.inventory || isNaN(parseInt(form.inventory)) || parseInt(form.inventory) < 0) {
      return Alert.alert('Error', 'Please enter a valid inventory quantity')
    }

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

      const productData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        sku: form.sku.trim() || undefined,
        inventory: parseInt(form.inventory),
        images: imageList,
        categoryId: selectedCategory,
        tags: tagList,
        weight: form.weight ? parseFloat(form.weight) : undefined,
      }

      const response = await api.createProduct(productData)
      if (response.success) {
        Alert.alert(
          'Product Created!',
          `"${form.name}" has been listed successfully.`,
          [{ text: 'View Products', onPress: () => router.replace('/seller/products') }]
        )
      } else {
        Alert.alert('Error', response.error || 'Failed to create product')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to create product. Please try again.')
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
        <Text style={styles.headerTitle}>Add New Product</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Maize Flour 2kg"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Describe your product in detail..."
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
                <Text style={styles.label}>Compare Price (KES)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  value={form.comparePrice}
                  onChangeText={(t) => setForm({ ...form, comparePrice: t })}
                  keyboardType="decimal-pad"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>
            {form.comparePrice && parseFloat(form.comparePrice) > parseFloat(form.price || '0') && (
              <View style={styles.discountHint}>
                <Feather name="tag" size={14} color={Colors.success} />
                <Text style={styles.discountHintText}>
                  {Math.round(((parseFloat(form.comparePrice) - parseFloat(form.price)) / parseFloat(form.comparePrice)) * 100)}% discount will show
                </Text>
              </View>
            )}
          </View>

          {/* Inventory */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inventory</Text>
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={form.inventory}
                  onChangeText={(t) => setForm({ ...form, inventory: t })}
                  keyboardType="number-pad"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>SKU</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. PROD-001"
                  value={form.sku}
                  onChangeText={(t) => setForm({ ...form, sku: t })}
                  autoCapitalize="characters"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
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
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Images</Text>
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

          {/* Tags & Weight */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            <Text style={styles.label}>Tags (comma-separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. organic, fresh, local"
              value={form.tags}
              onChangeText={(t) => setForm({ ...form, tags: t })}
              placeholderTextColor={Colors.text.tertiary}
            />

            <Text style={[styles.label, { marginTop: 14 }]}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2.5"
              value={form.weight}
              onChangeText={(t) => setForm({ ...form, weight: t })}
              keyboardType="decimal-pad"
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
                <Text style={styles.submitBtnText}>Publish Product</Text>
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
  discountHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: Colors.success + '12',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountHintText: { fontSize: 12, color: Colors.success, fontWeight: '600' },
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
