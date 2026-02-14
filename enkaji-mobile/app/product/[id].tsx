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
  Dimensions 
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { Product, Review } from '@/types'
import api from '@/lib/api'

const { width } = Dimensions.get('window')
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x400/e5e5e5/666666?text=No+Image'

export default function ProductDetailScreen() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const { addItem } = useCartStore()
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    setIsLoading(true)
    try {
      const [productRes, reviewsRes] = await Promise.all([
        api.getProduct(productId),
        api.getProductReviews(productId)
      ])

      if (productRes.success && productRes.data) {
        setProduct(productRes.data)
      }
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data)
      }
    } catch (error) {
      console.error('Error loading product:', error)
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
        updatedAt: new Date().toISOString()
      })
      Alert.alert('Success', 'Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      Alert.alert('Error', 'Failed to add to cart')
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
          createdAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    )
  }

  const images = product.images?.length > 0 ? product.images : [PLACEHOLDER_IMAGE]

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: images[selectedImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Feather 
              name={isFavorite(product.id) ? 'heart' : 'heart'} 
              size={24} 
              color={isFavorite(product.id) ? '#EF4444' : '#666'} 
              style={isFavorite(product.id) ? { fill: '#EF4444' } : {}}
            />
          </TouchableOpacity>
        </View>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.thumbnailContainer}
          >
            {images.map((img, index) => (
              <TouchableOpacity 
                key={index}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image 
                  source={{ uri: img }}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailSelected
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.price}>KES {product.price.toLocaleString()}</Text>
            {product.comparePrice && product.comparePrice > product.price && (
              <Text style={styles.comparePrice}>
                KES {product.comparePrice.toLocaleString()}
              </Text>
            )}
          </View>

          {product._count?.reviews ? (
            <View style={styles.ratingRow}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Feather 
                    key={star}
                    name="star" 
                    size={16} 
                    color={star <= (product.avgRating || 0) ? '#F59E0B' : '#ddd'} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {product.avgRating?.toFixed(1) || '0.0'} ({product._count.reviews} reviews)
              </Text>
            </View>
          ) : null}

          <View style={styles.sellerRow}>
            <Feather name="store" size={16} color="#666" />
            <Text style={styles.sellerText}>
              {product.seller?.sellerProfile?.businessName || 'Enkaji Seller'}
            </Text>
            {product.seller?.sellerProfile?.isVerified && (
              <Feather name="check-circle" size={14} color="#10B981" />
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Specifications</Text>
              {Object.entries(product.specifications).map(([key, value]) => (
                <View key={key} style={styles.specRow}>
                  <Text style={styles.specKey}>{key}</Text>
                  <Text style={styles.specValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
              {reviews.slice(0, 3).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewUser}>
                      {review.user?.firstName || 'Anonymous'}
                    </Text>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather 
                          key={star}
                          name="star" 
                          size={12} 
                          color={star <= review.rating ? '#F59E0B' : '#ddd'} 
                        />
                      ))}
                    </View>
                  </View>
                  {review.title && (
                    <Text style={styles.reviewTitle}>{review.title}</Text>
                  )}
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Feather name="minus" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Feather name="plus" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.addToCartButton, isAddingToCart && styles.addToCartButtonDisabled]}
          onPress={handleAddToCart}
          disabled={isAddingToCart}
        >
          <Feather name="shopping-cart" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width,
    backgroundColor: '#f5f5f5',
  },
  favoriteButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  thumbnailSelected: {
    borderWidth: 2,
    borderColor: '#000',
  },
  infoContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  comparePrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sellerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 5,
  },
  section: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  specKey: {
    fontSize: 14,
    color: '#666',
  },
  specValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  reviewCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 15,
  },
  quantityButton: {
    padding: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 15,
    color: '#000',
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
  },
  addToCartButtonDisabled: {
    opacity: 0.6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
})

