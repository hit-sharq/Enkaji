import { useState, useEffect, useRef } from 'react'
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
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native'
import { useRouter, useLocalSearchParams, Stack } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore, useFavoritesStore, useAuthStore } from '@/lib/store'
import { Product, Review } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ImageCarousel } from '@/components/product/image-carousel'

const { width } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const { addItem } = useCartStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const { user, isAuthenticated } = useAuthStore()

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

      // API returns the raw product object directly (not wrapped in {success, data})
      if (productRes && productRes.id) {
        // Map averageRating → avgRating to match our type
        setProduct({ ...productRes, avgRating: productRes.avgRating ?? productRes.averageRating ?? 0 })
      }

      // Reviews API returns { reviews: [...], pagination: {...} }
      if (reviewsRes && Array.isArray(reviewsRes.reviews)) {
        setReviews(reviewsRes.reviews)
      } else if (reviewsRes && productRes.reviews) {
        // Fallback: use reviews embedded in the product response
        setReviews(productRes.reviews)
      }
    } catch (error) {
      console.error('Failed to load product:', error)
      Alert.alert('Error', 'Failed to load product. Check your connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    setIsAddingToCart(true)
    try {
      // Always add to local cart state first for instant feedback
      addItem({
        id: `temp-${Date.now()}`,
        userId: '',
        productId: product.id,
        product,
        quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Try to sync with server (requires auth) — silently ignore if not signed in
      if (isAuthenticated) {
        try {
          await api.addToCart(product.id, quantity)
        } catch (syncErr) {
          console.warn('Cart sync failed (will retry on next load):', syncErr)
        }
      }

      Alert.alert('Added to Cart', `${product.name} (x${quantity}) added to your cart!`)
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart.')
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

  const handleSubmitReview = async () => {
    if (!product) return
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to leave a review.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/sign-in') },
      ])
      return
    }
    if (!reviewComment.trim()) {
      Alert.alert('Error', 'Please write a comment for your review.')
      return
    }
    setIsSubmittingReview(true)
    try {
      const response = await api.createReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment: reviewComment.trim(),
      })
      if (response.success) {
        setShowReviewModal(false)
        setReviewRating(5)
        setReviewTitle('')
        setReviewComment('')
        Alert.alert('Thank You!', 'Your review has been submitted.')
        if (id) loadProduct(id)
      } else {
        Alert.alert('Error', response.error || 'Failed to submit review.')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to submit review. You may have already reviewed this product.')
    } finally {
      setIsSubmittingReview(false)
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
          {/* Image Gallery Carousel */}
          <ImageCarousel images={images} productName={product.name} />

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
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewModal(true)}
              >
                <Feather name="edit-3" size={14} color={Colors.primary} />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            </View>
            {reviews.length > 0 && (
              <View style={styles.reviewsRatingSummary}>
                <Text style={styles.avgRatingBig}>{product.avgRating?.toFixed(1)}</Text>
                <Text style={styles.reviewsCount}>/ 5 · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
              </View>
            )}
            {reviews.length === 0 ? (
              <TouchableOpacity style={styles.noReviewsCard} onPress={() => setShowReviewModal(true)}>
                <Feather name="star" size={28} color={Colors.border} />
                <Text style={styles.noReviewsText}>No reviews yet</Text>
                <Text style={styles.noReviewsSub}>Be the first to review this product</Text>
              </TouchableOpacity>
            ) : (
              reviews.slice(0, 4).map((review) => (
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
              ))
            )}
          </View>

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

      {/* Review Submission Modal */}
      <Modal visible={showReviewModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.reviewModal}>
          <View style={styles.reviewModalHeader}>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Feather name="x" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.reviewModalTitle}>Write a Review</Text>
            <View style={{ width: 24 }} />
          </View>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.reviewModalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.reviewProductName}>{product.name}</Text>

              <Text style={styles.reviewFieldLabel}>Your Rating *</Text>
              <View style={styles.starSelector}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                    <Feather
                      name="star"
                      size={36}
                      color={star <= reviewRating ? '#EAB308' : Colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>
                {reviewRating === 1 ? 'Poor' : reviewRating === 2 ? 'Fair' : reviewRating === 3 ? 'Good' : reviewRating === 4 ? 'Very Good' : 'Excellent'}
              </Text>

              <Text style={[styles.reviewFieldLabel, { marginTop: 20 }]}>Review Title</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Summarise your experience"
                value={reviewTitle}
                onChangeText={setReviewTitle}
                placeholderTextColor={Colors.text.tertiary}
              />

              <Text style={[styles.reviewFieldLabel, { marginTop: 14 }]}>Comment *</Text>
              <TextInput
                style={[styles.reviewInput, styles.reviewTextarea]}
                placeholder="Tell others about your experience with this product..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={5}
                placeholderTextColor={Colors.text.tertiary}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.reviewSubmitBtn, isSubmittingReview && { opacity: 0.7 }]}
                onPress={handleSubmitReview}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="send" size={16} color="#fff" />
                    <Text style={styles.reviewSubmitText}>Submit Review</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  writeReviewText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  noReviewsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  noReviewsSub: {
    fontSize: 13,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  reviewModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reviewModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  reviewModalContent: {
    padding: 20,
    paddingBottom: 48,
  },
  reviewProductName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 20,
    lineHeight: 22,
  },
  reviewFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  starSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 13,
    color: '#EAB308',
    fontWeight: '700',
    marginBottom: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  reviewTextarea: {
    height: 120,
    textAlignVertical: 'top',
  },
  reviewSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  reviewSubmitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})
