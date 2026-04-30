import { useState, useCallback, useEffect, useRef } from 'react'
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface UseLazyImagesOptions {
  threshold?: number // pixels from bottom before loading (default: 200)
  enabled?: boolean
}

export function useLazyImages(options: UseLazyImagesOptions = {}) {
  const { threshold = 200, enabled = true } = options
  const loadedIds = useRef<Set<string>>(new Set())
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())

  const measureVisibility = useCallback((scrollY: number, itemHeight: number, index: number) => {
    const itemTop = index * itemHeight
    const itemBottom = itemTop + itemHeight
    const viewportBottom = scrollY + SCREEN_HEIGHT + threshold

    return itemBottom <= viewportBottom
  }, [threshold])

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!enabled) return

    const scrollY = event.nativeEvent.contentOffset.y
    // This would need to be combined with FlatList's onViewableItemsChanged for full effect
  }, [enabled])

  const markAsVisible = useCallback((id: string) => {
    setVisibleIds(prev => new Set([...prev, id]))
  }, [])

  const isVisible = useCallback((id: string) => {
    return visibleIds.has(id) || loadedIds.current.has(id)
  }, [visibleIds])

  const markAsLoaded = useCallback((id: string) => {
    loadedIds.current.add(id)
  }, [])

  return {
    onScroll,
    isVisible,
    markAsVisible,
    markAsLoaded,
  }
}

// Intersection Observer-like hook for list items
export function useViewportObserver<T>(
  data: T[],
  options?: { enabled?: boolean }
) {
  const [visibleRange, setVisibleRange] = useState<[number, number]>([0, 10])
  const observerRef = useRef<IntersectionObserver | null>(null)
  const enabled = options?.enabled

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleIndices = entries
          .filter(entry => entry.isIntersecting)
          .map(entry => {
            const id = (entry.target as any).dataset?.id
            return Number(id)
          })
          .filter(id => !isNaN(id))

        if (visibleIndices.length > 0) {
          const min = Math.min(...visibleIndices)
          const max = Math.max(...visibleIndices)
          setVisibleRange([min - 5, max + 10]) // buffer of 5 before, 10 after
        }
      },
      {
        rootMargin: `0px 0px ${SCREEN_HEIGHT * 0.5}px 0px`,
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
   }, [enabled])

  const observe = useCallback((element: HTMLElement | null, index: number) => {
    if (observerRef.current && element) {
      element.dataset.id = String(index)
      observerRef.current.observe(element)
    }
  }, [])

  const isInViewport = useCallback((index: number) => {
    const [start, end] = visibleRange
    return index >= start && index <= end
  }, [visibleRange])

  return { observe, isInViewport }
}
