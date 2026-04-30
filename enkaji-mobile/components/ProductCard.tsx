import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useFavoritesStore } from '@/lib/store'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onPress?: (product: Product) => void
  onAddToCart?: (product: Product) => void
  variant?: 'grid' | 'featured'
}

export function ProductCard({ product, onPress, onAddToCart, variant = 'grid' }: ProductCardProps) {
   const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
   const favorite = isFavorite(product.id)
   const rating = product.avgRating || 0
   const reviewCount = product._count?.reviews || 0

  const handleFavorite = () => {
    if (favorite) {
      removeFavorite(product.id)
    } else {
      addFavorite({
        id: `fav-${product.id}`,
        userId: '',
        productId: product.id,
        product,
        createdAt: new Date().toISOString(),
      })
    }
  }

  const isFeatured = variant === 'featured'

  return (
    <Pressable
      style={[styles.container, isFeatured && styles.featuredContainer]}
      onPress={() => onPress?.(product)}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, isFeatured && styles.featuredImage]}>
        <Image
          source={{ uri: product.images?.[0] || 'https://via.placeholder.com/200' }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Favorite Button */}
        <Pressable style={styles.favoriteButton} onPress={handleFavorite}>
          <MaterialCommunityIcons
            name={favorite ? 'heart' : 'heart-outline'}
            size={24}
            color={favorite ? '#e74c3c' : '#fff'}
          />
        </Pressable>

         {/* Badge */}
         {product.comparePrice && product.comparePrice > product.price && (
           <View style={styles.discountBadge}>
             <Text style={styles.discountText}>
               -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
             </Text>
           </View>
         )}
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <MaterialCommunityIcons name="star" size={16} color="#f39c12" />
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          {reviewCount > 0 && <Text style={styles.reviewCount}>({reviewCount})</Text>}
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>KES {product.price?.toLocaleString()}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              KES {product.originalPrice?.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Stock Status */}
        <Text
          style={[
            styles.stockStatus,
            { color: product.inventory > 0 ? '#27ae60' : '#e74c3c' },
          ]}
        >
          {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
        </Text>

        {/* Add to Cart Button */}
         {variant === 'featured' && (
           <Pressable
             style={[styles.addButton, !product.inventory && styles.disabledButton]}
             onPress={() => onAddToCart?.(product)}
             disabled={product.inventory === 0}
           >
            <MaterialCommunityIcons name="shopping-outline" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 4,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredContainer: {
    marginHorizontal: 0,
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#f5f5f5',
    position: 'relative',
  },
  featuredImage: {
    height: 250,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 20,
    padding: 8,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#7f8c8d',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 12,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  stockStatus: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
})
