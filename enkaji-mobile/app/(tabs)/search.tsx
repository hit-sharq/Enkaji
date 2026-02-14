import { useState, useEffect, useCallback } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl 
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useProductsStore } from '@/lib/store'
import { Product } from '@/types'
import api from '@/lib/api'

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e5e5e5/666666?text=No+Image'

export default function SearchScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ category?: string; featured?: string; sort?: string }>()
  const { products, setProducts, isLoading, setLoading } = useProductsStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    // Load initial featured or category products
    loadInitialProducts()
  }, [params.category, params.featured, params.sort])

  const loadInitialProducts = async () => {
    setLoading(true)
    try {
      const queryParams: Record<string, string> = { limit: '20' }
      
      if (params.category) {
        queryParams.category = params.category
      }
      if (params.featured) {
        queryParams.featured = params.featured
      }
      if (params.sort) {
        queryParams.sortBy = params.sort
      }

      const response = await api.getProducts(queryParams)
      if (response.success && response.data) {
        setProducts(response.data)
        setSearchResults(response.data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setHasSearched(true)
    try {
      const response = await api.getProducts({ 
        search: searchQuery,
        limit: '20'
      })
      if (response.success && response.data) {
        setSearchResults(response.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadInitialProducts()
    setRefreshing(false)
  }

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
    >
      <Image 
        source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category?.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>KES {item.price.toLocaleString()}</Text>
          {item.comparePrice && item.comparePrice > item.price && (
            <Text style={styles.comparePrice}>KES {item.comparePrice.toLocaleString()}</Text>
          )}
        </View>
        {item._count?.reviews ? (
          <View style={styles.ratingRow}>
            <Feather name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {item.avgRating?.toFixed(1) || '0.0'} ({item._count.reviews})
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )

  const filters = [
    { label: 'All', value: '' },
    { label: 'Electronics', value: 'electronics' },
    { label: 'Fashion', value: 'fashion' },
    { label: 'Home', value: 'home' },
    { label: 'Agriculture', value: 'agriculture' },
  ]

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[
                styles.filterChip,
                item.value === (params.category || '') && styles.filterChipActive
              ]}
              onPress={() => router.push(`/search${item.value ? `?category=${item.value}` : ''}`)}
            >
              <Text style={[
                styles.filterChipText,
                item.value === (params.category || '') && styles.filterChipTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="search" size={64} color="#ccc" />
          <Text style={styles.emptyText}>
            {hasSearched ? 'No products found' : 'Search for products'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 15,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#000',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
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
    paddingBottom: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  productsList: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: '48%',
  },
  productImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#e5e5e5',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
    height: 36,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  comparePrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
})

