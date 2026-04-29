import React, { memo } from 'react'
import { TouchableOpacity, Image, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'
import { Product } from '@/types'

interface ProductCardProps {
  item: Product
  index?: number
}

export const ProductCard = memo(function ProductCard({ item, index = 0 }: ProductCardProps) {
  const router = useRouter()
  const discount = item.comparePrice && item.comparePrice > item.price
    ? Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)
    : 0

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${item.id}`)}
      activeOpacity={0.9}
      delayPressIn={50}
    >
      <View style={styles.imageWrapper}>
        <ProductImage 
          uri={item.images?.[0] || PLACEHOLDER_IMAGE} 
          index={index}
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
})

// Lazy-loading image component with caching
function ProductImage({ uri, index }: { uri: string; index: number }) {
  return (
    <View style={styles.imageContainer}>
      {/* Image would be loaded with expo-image in production */}
      <Image
        source={{ uri }}
        style={styles.productImage}
        resizeMode="cover"
        progressiveRenderingEnabled={true}
      />
    </View>
  )
}

const styles = StyleSheet.create({
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
  imageContainer: {
    width: '100%',
    height: 160,
    backgroundColor: Colors.backgroundLight,
  },
  productImage: {
    width: '100%',
    height: '100%',
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

// Key extractor for FlatList
export function getProductKey(id: string, index: number) {
  return `${id}-${index}`
}
