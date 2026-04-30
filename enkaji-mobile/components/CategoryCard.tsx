import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Category } from '@/types'

interface CategoryCardProps {
  category: Category
  onPress?: (category: Category) => void
}

const categoryIcons: { [key: string]: string } = {
  electronics: 'lightning-bolt',
  'fashion-apparel': 'tshirt-crew',
  'home-garden': 'home',
  construction: 'hammer-wrench',
  automotive: 'car',
  agriculture: 'sprout',
  default: 'shopping',
}

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const iconName = categoryIcons[category.slug] || categoryIcons.default

  return (
    <Pressable
      style={styles.container}
      onPress={() => onPress?.(category)}
    >
       {/* Icon/Image Container */}
       <View style={styles.iconContainer}>
         {category.imageUrl ? (
           <Image
             source={{ uri: category.imageUrl }}
             style={styles.image}
             resizeMode="cover"
           />
         ) : (
          <MaterialCommunityIcons
            name={iconName as any}
            size={40}
            color="#3498db"
          />
        )}
      </View>

      {/* Category Name */}
      <Text style={styles.name} numberOfLines={2}>
        {category.name}
      </Text>

      {/* Product Count */}
      {category.productCount && (
        <Text style={styles.count}>
          {category.productCount} products
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4,
  },
  count: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
  },
})
