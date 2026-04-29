import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Link } from 'expo-router'
import { Colors } from '@/lib/theme'
import { Product } from '@/types'
import { useFavoritesStore } from '@/lib/store'
import { useCartStore } from '@/lib/store'

interface ProductCardProps {
  product: Product
  showAddToCart?: boolean
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addFavorite, isFavorite } = useFavoritesStore()
  const { addItem } = useCartStore()
  const isFav = isFavorite(product.id)

  const handleAddToCart = () => {
    addItem({
      id: Date.now().toString(),
      productId: product.id,
      quantity: 1,
      product: {
        ...product,
        price: product.price || 0,
        weight: product.weight || 0
      }
    })
  }

  return (
    <View style={styles.card}>
      <Link href={`/product/${product.id}`} asChild>
        <TouchableOpacity style={styles.imageContainer}>
          <Image source={{ uri: product.imageUrl || product.images?.[0] }} style={styles.image} />
          {product.isFeatured && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}
        </TouchableOpacity>
      </Link>
      
      <TouchableOpacity 
        style={[styles.favButton, isFav && styles.favButtonActive]}
        onPress={() => addFavorite({ id: product.id, productId: product.id, product })}
        hitSlop={20}
      >
        <Feather name={isFav ? "heart" : "heart"} size={20} color={Colors.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Link href={`/product/${product.id}`} asChild>
          <TouchableOpacity>
            <Text style={styles.title} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.category}>{product.category?.name || 'Uncategorized'}</Text>
          </TouchableOpacity>
        </Link>
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>KSh {product.price?.toLocaleString()}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>KSh {product.originalPrice.toLocaleString()}</Text>
          )}
        </View>

        {showAddToCart && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  favButtonActive: {
    backgroundColor: Colors.dangerLight,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  category: {
    fontSize: 12,
    color: Colors.text.muted,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.text.muted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: '600',
  },
})

