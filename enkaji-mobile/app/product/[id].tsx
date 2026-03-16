import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { Product, Review } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  const { addItem } = useCartStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()

  useEffect(() => {
    if (id) loadProduct(id)
  }, [id])

  const loadProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      const [productRes, reviewsRes] = await Promise.all([
        api.getProduct(productId),
        api.getProductReviews(productId),
      ])
      if (productRes.success && productRes.data) setProduct(productRes.data)
      if (reviewsRes.success && reviewsRes.data) setReviews(reviewsRes.data)
    } catch (error) {
      Alert.alert('Error', 'Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    try {
      await api.addToCart(product.id, quantity)
      addItem({
        id: `temp-${Date.now()}`,
        userId: '',
        productId: product.id,
        product,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      Alert.alert('Added to Cart', `${product.name} (x${quantity}) added successfully!`)
    } catch (error) {
      Alert.alert('Error', 'Failed to add to cart. Please sign in first.')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    try {
      if (isFavorite(product.id)) {
        await api.removeFavorite(product.id)
        removeFavorite(product.id)
      } else {
        await api.addFavorite(product.id)
        addFavorite({
          id: `temp-${Date.now()}`,
          userId: '',
          productId: product.id,
          product,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={Colors.text.muted} />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER_IMAGE]
  const favorited = isFavorite(product.id)
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
          headerTintColor: Colors.text.primary,
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerButton}>
              <Feather name="heart" size={22} color={favorited ? '#EF4444' : Colors.text.tertiary} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageWrapper}>
            <Image
              source={{ uri: images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            {discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discount}% OFF</Text>
              </View>
            )}
            {product.inventory <= 5 && product.inventory > 0 && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Only {product.inventory} left</Text>
              </View>
            )}
          </View>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {images.map((img, index) => (
                <TouchableOpacity key={index} onPress={() => setSelectedImageIndex(index)}>
                  <Image
                    source={{ uri: img }}
                    style={[styles.thumbnail, selectedImageIndex === index && styles.thumbnailActive]}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Product Info */}
          <View style={styles.infoCard}>
            {/* Category + Title */}
            <Text style={styles.categoryLabel}>{product.category?.name?.toUpperCase()}</Text>
            <Text style={styles.productName}>{product.name}</Text>

            {/* Price Row */}
            <View style={styles.priceRow}>
              <Text style={styles.price}>KES {product.price.toLocaleString()}</Text>
              {product.comparePrice && product.comparePrice > product.price && (
                <Text style={styles.comparePrice}>KES {product.comparePrice.toLocaleString()}</Text>
              )}
              {discount > 0 && (
                <View style={styles.discountChip}>
                  <Text style={styles.discountChipText}>Save {discount}%</Text>
                </View>
              )}
            </View>

            {/* Rating */}
            {product._count?.reviews ? (
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather
                    key={star}
                    name="star"
                    size={15}
                    color={star <= Math.round(product.avgRating || 0) ? '#EAB308' : Colors.border}
                  />
                ))}
                <Text style={styles.ratingText}>
                  {product.avgRating?.toFixed(1)} · {product._count.reviews} review
                  {product._count.reviews !== 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}

            {/* Seller */}
            <TouchableOpacity style={styles.sellerRow}>
              <View style={styles.sellerIconBg}>
                <Feather name="store" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.sellerName}>
                {product.seller?.sellerProfile?.businessName || 'Enkaji Seller'}
              </Text>
              {product.seller?.sellerProfile?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check" size={10} color="#fff" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
              <Feather name="chevron-right" size={14} color={Colors.text.muted} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description} numberOfLines={showFullDesc ? undefined : 4}>
              {product.description}
            </Text>
            {product.description?.length > 200 && (
              <TouchableOpacity onPress={() => setShowFullDesc(!showFullDesc)}>
                <Text style={styles.readMore}>{showFullDesc ? 'Show less' : 'Read more'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value], index) => (
                <View
                  key={key}
                  style={[styles.specRow, index % 2 === 0 && styles.specRowAlt]}
                >
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.reviewsHeader}>
                <Text style={styles.sectionTitle}>Reviews</Text>
                <View style={styles.reviewsRatingSummary}>
                  <Text style={styles.avgRatingBig}>{product.avgRating?.toFixed(1)}</Text>
                  <Text style={styles.reviewsCount}>/ 5 · {reviews.length} reviews</Text>
                </View>
              </View>
              {reviews.slice(0, 4).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewTop}>
                    <View style={styles.reviewAvatar}>
                      <Text style={styles.reviewAvatarText}>
                        {(review.user?.firstName || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={styles.reviewUser}>{review.user?.firstName || 'Anonymous'}</Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Feather
                            key={star}
                            name="star"
                            size={11}
                            color={star <= review.rating ? '#EAB308' : Colors.border}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}
                  {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Feather name="minus" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity(Math.min(product.inventory, quantity + 1))}
            >
              <Feather name="plus" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.addToCartButton, isAddingToCart && { opacity: 0.7 }]}
            onPress={handleAddToCart}
            disabled={isAddingToCart || product.inventory === 0}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="shopping-cart" size={18} color="#fff" />
                <Text style={styles.addToCartText}>
                  {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
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
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 12,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: Colors.text.white,
    fontWeight: '600',
  },
  headerButton: {
    padding: 8,
  },
  // Image
  imageWrapper: {
    position: 'relative',
    backgroundColor: Colors.backgroundLight,
  },
  mainImage: {
    width,
    height: width * 0.85,
    backgroundColor: Colors.backgroundLight,
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: '700',
  },
  stockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stockText: {
    color: Colors.text.white,
    fontSize: 11,
    fontWeight: '700',
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: Colors.primary,
  },
  // Info Card
  infoCard: {
    backgroundColor: Colors.background,
    marginHorizontal: 0,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 8,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 6,
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    lineHeight: 28,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: 16,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
  discountChip: {
    backgroundColor: '#10B981' + '18',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 2,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginLeft: 6,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  sellerIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 3,
  },
  // Sections
  section: {
    backgroundColor: Colors.background,
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 14,
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  specRowAlt: {
    backgroundColor: Colors.backgroundSecondary,
  },
  specKey: {
    fontSize: 13,
    color: Colors.text.tertiary,
    flex: 1,
  },
  specValue: {
    fontSize: 13,
    color: Colors.text.primary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewsRatingSummary: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  avgRatingBig: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  reviewsCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
  reviewCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  reviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewAvatarText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '700',
  },
  reviewMeta: {
    flex: 1,
  },
  reviewUser: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
    color: Colors.text.muted,
  },
  reviewTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 12,
    color: Colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  addToCartText: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '700',
  },
})
