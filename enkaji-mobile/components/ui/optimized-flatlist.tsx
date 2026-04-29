import React, { useCallback, useRef, useMemo } from 'react'
import { FlatList, FlatListProps, Platform, ViewToken } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'keyExtractor'> {
  data: T[]
  renderItem: (info: { item: T; index: number }) => React.ReactElement
  getKey?: (item: T, index: number) => string | number
  initialNumToRender?: number
  maxToRenderPerBatch?: number
  windowSize?: number
  removeClippedSubviews?: boolean
  onVisible?: (visible: boolean) => void
}

export function OptimizedFlatList<T>({
  data,
  renderItem,
  getKey = (item: any, index: number) => index,
  initialNumToRender = 8,
  maxToRenderPerBatch = 6,
  windowSize = 10,
  removeClippedSubviews = Platform.OS === 'android',
  onVisible,
  ...props
}: OptimizedFlatListProps<T>) {
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  }).current

  const viewabilityConfigCallbackPairs = useRef([
    {
      viewabilityConfig,
      onViewableItemsChanged: ({ changed }: { changed: ViewToken[] }) => {
        if (onVisible && changed.length > 0) {
          onVisible(changed.some(c => c.isViewable) || changed[0].isViewable)
        }
      },
    },
  ]).current

  const keyExtractor = useCallback((item: T, index: number) => {
    return String(getKey(item, index))
  }, [getKey])

  // Memoize data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data])

  return (
    <FlatList
      data={memoizedData}
      renderItem={({ item, index }) => renderItem({ item, index })}
      keyExtractor={keyExtractor}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs}
      updateCellsBatchingPeriod={30}
      nestedScrollEnabled={true}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
      {...props}
    />
  )
}

// Usage:
// <OptimizedFlatList
//   data={products}
//   renderItem={({ item }) => <ProductCard item={item} />}
//   getKey={(item) => item.id}
//   initialNumToRender={10}
// />
