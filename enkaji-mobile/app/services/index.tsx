import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useServicesStore } from '@/lib/store'
import { ServiceLite } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const SCREEN_WIDTH = Dimensions.get('window').width

const SERVICE_CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Beauty', value: 'beauty' },
  { label: 'Health', value: 'health' },
  { label: 'Education', value: 'education' },
  { label: 'Automotive', value: 'automotive' },
  { label: 'Home', value: 'home' },
  { label: 'Events', value: 'events' },
  { label: 'Tech', value: 'tech' },
]

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
]

export default function ServicesScreen() {
  const router = useRouter()
  const { services, setServices, isLoading, setLoading } = useServicesStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [activeSort, setActiveSort] = useState('recommended')
  const [categories] = useState(SERVICE_CATEGORIES)
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    loadServices()
  }, [activeCategory, activeSort])

  const loadServices = async () => {
    setLoading(true)
    try {
      const queryParams: Record<string, string | number> = { limit: 24 }
      if (activeCategory) queryParams.category = activeCategory
      if (activeSort) queryParams.sortBy = activeSort

      const response = await api.getServices(queryParams)
      if (response.services) {
        setServices(response.services as ServiceLite[])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadServices()
    setRefreshing(false)
  }

  const handleSearch = async (text?: string) => {
    const query = text ?? searchQuery
    if (!query.trim()) {
      loadServices()
      return
    }
    setLoading(true)
    try {
      const response = await api.getServices({ search: query, limit: 24 })
      if (response.services) {
        setServices(response.services as ServiceLite[])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderServiceCard = ({ item }: { item: ServiceLite }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => router.push(`/services/${item.id}` as any)}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
        {item.averageRating > 0 && (
          <View style={styles.ratingBadge}>
            <Feather name="star" size={12} color="#fff" />
            <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <View style={styles.serviceInfo}>
        <Text style={styles.categoryLabel}>{item.category}</Text>
        <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.providerName}>{item.provider.businessName}</Text>
        <View style={styles.serviceMeta}>
          <Text style={styles.durationText}>{item.duration} min</Text>
          <Text style={styles.priceText}>KSh {item.price.toLocaleString()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderCategoryChip = ({ label, value }: { label: string; value: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        activeCategory === value && styles.categoryChipActive,
      ]}
      onPress={() => setActiveCategory(value)}
    >
      <Text
        style={[
          styles.categoryChipText,
          activeCategory === value && styles.categoryChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )

  const renderSortOption = ({ label, value }: { label: string; value: string }) => (
    <TouchableOpacity
      style={[
        styles.sortChip,
        activeSort === value && styles.sortChipActive,
      ]}
      onPress={() => setActiveSort(value)}
    >
      <Text
        style={[
          styles.sortChipText,
          activeSort === value && styles.sortChipTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  )

  if (isLoading && !services.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => handleSearch()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); loadServices(); }}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={[
                styles.categoryChip,
                activeCategory === cat.value && styles.categoryChipActive,
              ]}
              onPress={() => setActiveCategory(cat.value)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  activeCategory === cat.value && styles.categoryChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.sortChip,
                activeSort === opt.value && styles.sortChipActive,
              ]}
              onPress={() => setActiveSort(opt.value)}
            >
              <Text
                style={[
                  styles.sortChipText,
                  activeSort === opt.value && styles.sortChipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Services List */}
      {isLoading && refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="search" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No services found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceCard}
          numColumns={2}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    color: '#666',
    fontWeight: '500',
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sortContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fef3f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginRight: 8,
  },
  sortChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  servicesList: {
    padding: 12,
  },
  serviceCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 12,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  serviceInfo: {
    padding: 12,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
    lineHeight: 20,
  },
  providerName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#888',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
})
