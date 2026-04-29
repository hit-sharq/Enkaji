import React, { useState, useRef, useCallback } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList, Image } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Colors } from '@/lib/theme'
import { Product } from '@/types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface ImageCarouselProps {
  images: string[]
  productName?: string
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const flatListRef = useRef<FlatList>(null)

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index)
    }
  }, [])

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  }

  const goToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true })
    setCurrentIndex(index)
  }

  const renderItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item }}
        style={styles.image}
        resizeMode="cover"
        progressiveRenderingEnabled
      />
    </View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        maxToRenderPerBatch={3}
        initialNumToRender={1}
        windowSize={3}
        removeClippedSubviews
      />

      {/* Dots indicator */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index < currentIndex && styles.dotVisited,
              ]}
            />
          ))}
        </View>
      )}

      {/* Image counter */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {images.length}
        </Text>
      </View>
    </View>
  )
}

// Placeholder for no images
export function NoImagesPlaceholder() {
  return (
    <View style={[styles.slide, styles.placeholder]}>
      <Feather name="image" size={48} color={Colors.text.muted} />
      <Text style={styles.placeholderText}>No images available</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: 300,
    backgroundColor: Colors.backgroundLight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.muted,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: Colors.primary,
    width: 20,
  },
  dotVisited: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  counter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: '600',
  },
})
