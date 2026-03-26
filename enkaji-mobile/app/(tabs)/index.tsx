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
  RefreshControl,
  TextInput,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useProductsStore } from '@/lib/store'
import { Product, Category } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const PROMO_BANNERS = [
  { title: 'New Arrivals', subtitle: 'Discover fresh products', bg: Colors.primary },
  { title: 'Top Sellers', subtitle: 'Trending this week', bg: '#D2691E' },
  { title: 'B2B Deals', subtitle: 'Bulk order discounts', bg: '#228B22' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { featuredProducts, categories, setFeaturedProducts, setCategories, isLoading, setLoading } = useProductsStore()
  const [refreshing, setRefreshing] = useState(false)
  const [activeBanner, setActiveBanner] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBanner((b) => (b + 1) % PROMO_BANNERS.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.getProducts({ limit: 12 }),
        api.getCategories(),
      ])
      if (productsRes.products) setFeaturedProducts(productsRes.products)
      if (categoriesRes.categories) setCategories(categoriesRes.categories)
      else if (Array.isArray(categoriesRes)) setCategories(categoriesRes)
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

  const handleSearch = () => {
    if (searchQuery.trim()) router.push(`/search?q=${searchQuery}`)
    else router.push('/search')
  }

  const renderProductCard = ({ item }: { item: Product }) => {
    const discount =
      item.comparePrice && item.comparePrice > item.price
        ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
        : 0

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.9}
      >
        <View style={styles.productImageWrapper}>
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
          <Text style={styles.productCategory}>{item.category?.name}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
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
                {item.avgRating?.toFixed(1)} ({item._count.reviews})
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    )
  }

  const renderCategoryCard = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/search?category=${item.slug}`)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.imageUrl || PLACEHOLDER_IMAGE }}
        style={styles.categoryImage}
        resizeMode="cover"
      />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading && featuredProducts.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Enkaji...</Text>
      </SafeAreaView>
    )
  }

  const banner = PROMO_BANNERS[activeBanner]

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Hero Header */}
        <SafeAreaView edges={['top']} style={styles.heroSection}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroGreeting}>Kenya's B2B Marketplace</Text>
              <Text style={styles.heroTitle}>Enkaji</Text>
            </View>
            <TouchableOpacity
              style={styles.notifButton}
              onPress={() => router.push('/profile')}
            >
              <Feather name="bell" size={22} color={Colors.text.white} />
            </TouchableOpacity>
          </View>

          {/* Search Bar in Hero */}
          <TouchableOpacity
            style={styles.heroSearch}
            onPress={() => router.push('/search')}
            activeOpacity={0.85}
          >
            <Feather name="search" size={18} color={Colors.text.tertiary} />
            <Text style={styles.heroSearchPlaceholder}>Search products, categories...</Text>
            <View style={styles.heroSearchFilter}>
              <Feather name="sliders" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>

          {/* Stats Strip */}
          <View style={styles.statsStrip}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5K+</Text>
              <Text style={styles.statLabel}>Suppliers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Counties</Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Promo Banner */}
        <View style={[styles.promoBanner, { backgroundColor: banner.bg }]}>
          <View style={styles.promoBannerContent}>
            <View>
              <Text style={styles.promoBannerTitle}>{banner.title}</Text>
              <Text style={styles.promoBannerSub}>{banner.subtitle}</Text>
            </View>
            <TouchableOpacity
              style={styles.promoBannerBtn}
              onPress={() => router.push('/search')}
            >
              <Text style={styles.promoBannerBtnText}>Shop</Text>
              <Feather name="arrow-right" size={14} color={banner.bg} />
            </TouchableOpacity>
          </View>
          <View style={styles.promoDots}>
            {PROMO_BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.promoDot, i === activeBanner && styles.promoDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity onPress={() => router.push('/search')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={categories.slice(0, 8)}
              renderItem={renderCategoryCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Featured Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredProducts.length > 0 ? (
            <FlatList
              horizontal
              data={featuredProducts.slice(0, 8)}
              renderItem={renderProductCard}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          ) : (
            <View style={styles.emptyProducts}>
              <Text style={styles.emptyProductsText}>No products available yet</Text>
            </View>
          )}
        </View>

        {/* New Arrivals */}
        {featuredProducts.length > 4 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <TouchableOpacity onPress={() => router.push('/search?sort=newest')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featuredProducts.slice(4, 12)}
              renderItem={renderProductCard}
              keyExtractor={(item) => `${item.id}-new`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Value Props */}
        <View style={styles.valueSection}>
          <Text style={styles.sectionTitle}>Why Enkaji?</Text>
          <View style={styles.valueGrid}>
            {[
              { icon: 'shield', title: 'Secure Payments', desc: 'Protected by Pesapal & escrow', color: '#10B981' },
              { icon: 'truck', title: 'Nationwide Delivery', desc: 'All 47 counties covered', color: '#3B82F6' },
              { icon: 'award', title: 'Verified Sellers', desc: 'Background-checked suppliers', color: '#F59E0B' },
              { icon: 'users', title: 'B2B & B2C', desc: 'Built for businesses & individuals', color: Colors.primary },
            ].map((item, i) => (
              <View key={i} style={styles.valueCard}>
                <View style={[styles.valueIconBg, { backgroundColor: item.color + '18' }]}>
                  <Feather name={item.icon as any} size={20} color={item.color} />
                </View>
                <Text style={styles.valueTitle}>{item.title}</Text>
                <Text style={styles.valueDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Become a Seller CTA */}
        <View style={styles.sellerCTA}>
          <View style={styles.sellerCTAContent}>
            <View>
              <Text style={styles.sellerCTATitle}>Sell on Enkaji</Text>
              <Text style={styles.sellerCTAText}>Join 5K+ sellers growing their business</Text>
            </View>
            <TouchableOpacity
              style={styles.sellerCTABtn}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.sellerCTABtnText}>Get Started</Text>
              <Feather name="arrow-right" size={14} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  container: {
    flex: 1,
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
  // Hero
  heroSection: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 8,
  },
  heroGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text.white,
    letterSpacing: -0.5,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  heroSearchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.muted,
    marginLeft: 8,
  },
  heroSearchFilter: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '500',
  },
  // Promo Banner
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    overflow: 'hidden',
  },
  promoBannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.white,
    marginBottom: 4,
  },
  promoBannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },
  promoBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  promoBannerBtnText: {
    fontWeight: '700',
    fontSize: 13,
    color: Colors.text.primary,
  },
  promoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 5,
  },
  promoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  promoDotActive: {
    backgroundColor: Colors.text.white,
    width: 18,
  },
  // Sections
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
  },
  // Category Card
  categoryCard: {
    width: 110,
    height: 90,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 38, 53, 0.45)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  categoryName: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 11,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  // Product Card
  productCard: {
    width: 155,
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 150,
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
    fontSize: 9,
    fontWeight: '700',
  },
  productInfo: {
    padding: 10,
  },
  productCategory: {
    fontSize: 9,
    color: Colors.text.tertiary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 16,
    marginBottom: 6,
    minHeight: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: 10,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 10,
    color: Colors.text.tertiary,
    marginLeft: 3,
  },
  emptyProducts: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyProductsText: {
    fontSize: 14,
    color: Colors.text.muted,
  },
  // Value Props
  valueSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  valueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 10,
  },
  valueCard: {
    width: '47.5%',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  valueIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  valueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  valueDesc: {
    fontSize: 11,
    color: Colors.text.tertiary,
    lineHeight: 15,
  },
  // Seller CTA
  sellerCTA: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.primary + '10',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
    padding: 18,
  },
  sellerCTAContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sellerCTATitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  sellerCTAText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  sellerCTABtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.text.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  sellerCTABtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
})
