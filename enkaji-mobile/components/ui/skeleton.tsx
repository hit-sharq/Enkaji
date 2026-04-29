import { View, StyleSheet, ViewStyle } from 'react-native'
import { Colors } from '@/lib/theme'
import { useEffect, useRef } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
  variant?: 'text' | 'circle' | 'rect'
}

export function Skeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = 4, 
  style,
  variant = 'text' 
}: SkeletonProps) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const getSkeletonStyle = (): ViewStyle => {
    if (variant === 'circle') {
      return {
        width: width,
        height: width,
        borderRadius: (width as number) / 2,
      }
    }
    if (variant === 'rect') {
      return {
        width,
        height,
        borderRadius,
      }
    }
    // text variant - pill shape
    return {
      width,
      height,
      borderRadius: borderRadius * 2,
    }
  }

  return (
    <Animated.View
      style={[
        styles.base,
        getSkeletonStyle(),
        animatedStyle,
        style,
      ]}
    />
  )
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <Skeleton 
        width="100%" 
        height={160} 
        variant="rect" 
        style={styles.imageSkeleton}
      />
      <View style={styles.productInfo}>
        <Skeleton width="60%" height={10} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={12} />
      </View>
    </View>
  )
}

// Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <View style={styles.categoryCard}>
      <Skeleton width={60} height={60} variant="circle" />
      <Skeleton width="100%" height={12} style={{ marginTop: 8 }} />
    </View>
  )
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={50} height={50} variant="circle" style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width="70%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="40%" height={10} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.backgroundLight,
  },
  productCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageSkeleton: {
    marginBottom: 12,
  },
  productInfo: {
    paddingHorizontal: 10,
    paddingBottom: 12,
  },
  categoryCard: {
    alignItems: 'center',
    padding: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
})
