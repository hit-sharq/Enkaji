import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from '@/lib/theme'
import { Product } from '@/types'
import { useCartStore } from '@/lib/store'

interface CartItemProps {
  id: string
  product: Product
  quantity: number
}

export default function CartItem({ id, product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleIncrease = () => updateQuantity(id, quantity + 1)
  const handleDecrease = () => {
    if (quantity > 1) updateQuantity(id, quantity - 1)
    else removeItem(id)
  }

  const handleRemove = () => removeItem(id)

  const itemTotal = (product.price || 0) * quantity

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.images?.[0] || product.imageUrl }} style={styles.image} />
      
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>KSh {(product.price || 0).toLocaleString()}</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
            <Feather name="minus" size={16} color={Colors.text.muted} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
            <Feather name="plus" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.total}>KSh {itemTotal.toLocaleString()}</Text>
        <TouchableOpacity style={styles.removeButton} onPress={handleRemove} hitSlop={20}>
          <Feather name="trash-2" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    alignItems: 'center',
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  price: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  rightSection: {
    alignItems: 'flex-end',
    gap: 8,
  },
  total: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  removeButton: {
    padding: 8,
  },
})

