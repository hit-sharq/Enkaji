import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity?: (quantity: number) => void
  onRemove?: () => void
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const product = item.product
  const price = product?.price || 0
  const subtotal = price * item.quantity

  return (
    <View style={styles.container}>
      {/* Product Image */}
      <Image
        source={{
          uri: product?.images?.[0] || 'https://via.placeholder.com/80',
        }}
        style={styles.image}
        resizeMode="cover"
      />

      {/* Product Info */}
      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product?.name}
        </Text>

         <Text style={styles.seller}>
           {product?.seller
             ? [product.seller.firstName, product.seller.lastName].filter(Boolean).join(' ') || 'Enkaji Store'
             : 'Enkaji Store'}
         </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>KES {price.toLocaleString()}</Text>
          {product?.originalPrice && (
            <Text style={styles.originalPrice}>
              KES {product.originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <Pressable
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity?.(Math.max(1, item.quantity - 1))}
          >
            <MaterialCommunityIcons name="minus" size={16} color="#3498db" />
          </Pressable>

          <Text style={styles.quantity}>{item.quantity}</Text>

          <Pressable
            style={styles.quantityButton}
            onPress={() => onUpdateQuantity?.(item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#3498db" />
          </Pressable>

          <View style={{ flex: 1 }} />

          {/* Subtotal */}
          <Text style={styles.subtotal}>
            KES {subtotal.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Remove Button */}
      <Pressable style={styles.removeButton} onPress={onRemove}>
        <MaterialCommunityIcons name="close" size={24} color="#e74c3c" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  seller: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e74c3c',
  },
  originalPrice: {
    fontSize: 11,
    color: '#95a5a6',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginHorizontal: 6,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
})
