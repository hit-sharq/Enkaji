import { useEffect, useState } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useProductsStore } from '@/lib/store'
import { Product, Category } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

export default function HomeScreen() {
  const router = useRouter()
  const { featuredProducts, categories, setFeaturedProducts, setCategories, isLoading, setLoading } = useProductsStore()
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const productsRes = await api.getProducts({ limit: 10 })
      if (productsRes.success && productsRes.data) {
        setFeaturedProducts(productsRes.data)
      }

      const categoriesRes = await api.getCategories()
      if (categoriesRes.success && categoriesRes.data) {
        setCategories(categoriesRes.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadData()
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
            <Feather name="star" size={14} color={Colors.gold} />
            <Text style={styles.ratingText}>
              {item.avgRating?.toFixed(1) || '0.0'} ({item._count.reviews})
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  )

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => router.push(`/categories/${item.slug}`)}
    >
      <Image 
        source={{ uri: item.imageUrl || PLACEHOLDER_IMAGE }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading && featuredProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Enkaji...</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Hero Section with Enkaji Brand Gradient */}
      <View style={[styles.heroSection, { backgroundColor: Colors.primary }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome to Enkaji</Text>
          <Text style={styles.heroSubtitle}>Kenya's Trusted Marketplace</Text>
          <Text style={styles.heroTagline}>Quality Products • Verified Sellers • Secure Payments</Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => router.push('/search')}
          >
            <Text style={styles.ctaButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={categories.slice(0, 6)}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => router.push('/search?featured=true')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={featuredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* New Arrivals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <TouchableOpacity onPress={() => router.push('/search?sort=newest')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={featuredProducts.slice().reverse()}
          renderItem={renderProductCard}
          keyExtractor={(item) => `${item.id}-reverse`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      {/* Value Propositions - Enkaji Brand */}
      <View style={styles.valueProps}>
        <View style={styles.valueProp}>
          <View style={styles.valueIconContainer}>
            <Feather name="shield" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.valuePropTitle}>Secure Payments</Text>
          <Text style={styles.valuePropText}>Protected by Pesapal</Text>
        </View>
        <View style={styles.valuePropDivider} />
        <View style={styles.valueProp}>
          <View style={styles.valueIconContainer}>
            <Feather name="truck" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.valuePropTitle}>Fast Delivery</Text>
          <Text style={styles.valuePropText}>Nationwide shipping</Text>
        </View>
        <View style={styles.valuePropDivider} />
        <View style={styles.valueProp}>
          <View style={styles.valueIconContainer}>
            <Feather name="award" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.valuePropTitle}>Quality Products</Text>
          <Text style={styles.valuePropText}>Verified sellers</Text>
        </View>
      </View>

      {/* Brand Footer */}
      <View style={styles.brandFooter}>
        <Text style={styles.brandFooterText}>© 2024 Enkaji Marketplace</Text>
        <Text style={styles.brandFooterSubtext}>Kenya's Premier B2B & B2C Platform</Text>
      </View>
    </ScrollView>
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
    color: Colors.text.secondary,
    fontSize: 14,
  },
  // Hero Section - Professional Enkaji Gradient
  heroSection: {
    paddingTop: 50,
    paddingBottom: 30,
    backgroundColor: Colors.primary,
  },
  heroGradient: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.white,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 24,
    fontWeight: '400',
  },
  ctaButton: {
    backgroundColor: Colors.text.white,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  // Section Styles
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  // Category Cards
  categoriesList: {
    paddingRight: 16,
  },
  categoryCard: {
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    width: 140,
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 38, 53, 0.4)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  categoryName: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Product Cards
  productsList: {
    paddingRight: 16,
  },
  productCard: {
    width: 165,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  productImage: {
    width: '100%',
    height: 165,
    backgroundColor: Colors.backgroundLight,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 6,
    height: 40,
    lineHeight: 20,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  // Value Propositions
  valueProps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    padding: 24,
    marginTop: 24,
    marginHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  valueProp: {
    alignItems: 'center',
    flex: 1,
  },
  valuePropDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.borderLight,
  },
  valueIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  valuePropTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  valuePropText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
    textAlign: 'center',
  },
  // Brand Footer
  brandFooter: {
    alignItems: 'center',
    padding: 30,
    paddingBottom: 40,
  },
  brandFooterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  brandFooterSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
})

