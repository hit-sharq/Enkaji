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
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useProductsStore } from '@/lib/store'
import { Product } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'
import { SafeAreaView } from 'react-native-safe-area-context'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Home & Garden', value: 'home' },
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Textiles', value: 'textiles' },
  { label: 'Food', value: 'food' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Popular', value: 'popular' },
]

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ category?: string; featured?: string; sort?: string }>()
  const { setProducts, isLoading, setLoading } = useProductsStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeFilter, setActiveFilter] = useState(params.category || '')
  const [activeSort, setActiveSort] = useState(params.sort || 'newest')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    loadProducts()
  }, [activeFilter, activeSort])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const queryParams: Record<string, string> = { limit: '24' }
      if (activeFilter) queryParams.category = activeFilter
      if (activeSort) queryParams.sortBy = activeSort

      const response = await api.getProducts(queryParams)
      if (response.products) {
        setProducts(response.products)
        setSearchResults(response.products)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (text?: string) => {
    const query = text ?? searchQuery
    if (!query.trim()) {
      loadProducts()
      setHasSearched(false)
      return
    }
    setLoading(true)
    setHasSearched(true)
    try {
      const response = await api.getProducts({ search: query, limit: '24' })
      if (response.products) {
        setSearchResults(response.products)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setHasSearched(false)
    loadProducts()
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const renderProductCard = ({ item }: { item: Product }) => {
    const discount = item.comparePrice && item.comparePrice > item.price
      ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
      : 0

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productCategory} numberOfLines={1}>
            {item.category?.name || 'General'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>KES {item.price.toLocaleString()}</Text>
            {item.comparePrice && item.comparePrice > item.price && (
              <Text style={styles.comparePrice}>KES {item.comparePrice.toLocaleString()}</Text>
            )}
          </View>
          {item._count?.reviews ? (
            <View style={styles.ratingRow}>
              <Feather name="star" size={11} color={Colors.gold} />
              <Text style={styles.ratingText}>
                {item.avgRating?.toFixed(1) || '0.0'} ({item._count.reviews})
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={Colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search products, categories..."
            placeholderTextColor={Colors.text.muted}
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t)
              if (!t) clearSearch()
            }}
            onSubmitEditing={() => handleSearch()}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <View style={styles.clearIcon}>
                <Feather name="x" size={12} color={Colors.text.white} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.filtersRow}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === item.value && styles.filterChipActive]}
              onPress={() => setActiveFilter(item.value)}
            >
              <Text
                style={[styles.filterChipText, activeFilter === item.value && styles.filterChipTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort Row */}
      {!hasSearched && (
        <View style={styles.sortRow}>
          <Text style={styles.resultsCount}>
            {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
          </Text>
          <FlatList
            horizontal
            data={SORT_OPTIONS}
            keyExtractor={(item) => item.value}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sortChip, activeSort === item.value && styles.sortChipActive]}
                onPress={() => setActiveSort(item.value)}
              >
                <Text
                  style={[styles.sortChipText, activeSort === item.value && styles.sortChipTextActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding products...</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="search" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {hasSearched ? 'No products found' : 'Start searching'}
          </Text>
          <Text style={styles.emptyText}>
            {hasSearched
              ? `No results for "${searchQuery}"`
              : 'Type to search for products'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  searchContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    paddingVertical: 2,
  },
  clearButton: {
    padding: 2,
  },
  clearIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.text.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersRow: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.white,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCount: {
    fontSize: 13,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.background,
    marginLeft: 6,
  },
  sortChipActive: {
    backgroundColor: Colors.primary + '15',
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.tertiary,
  },
  sortChipTextActive: {
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  productsList: {
    padding: 12,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48.5%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.backgroundLight,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: Colors.text.white,
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 10,
    color: Colors.text.tertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 18,
    marginBottom: 6,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: 11,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginLeft: 3,
  },
})
