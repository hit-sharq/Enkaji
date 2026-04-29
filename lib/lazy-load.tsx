'use client'

import { lazy, Suspense, ComponentType, LazyExoticComponent } from 'react'
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native'
import { Colors } from '@/lib/theme'

// Generic lazy loader with fallback
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
): LazyExoticComponent<T> {
  return lazy(importFn)
}

// Suspense wrapper with skeleton fallback
export function LazyBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<View style={styles.skeleton} />}>
      {children}
    </Suspense>
  )
}

// Delay-based lazy loader (delay the import to prioritize critical rendering)
export function delayedLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  delay: number = 300
): LazyExoticComponent<T> {
  return lazy(() => new Promise(resolve => {
    setTimeout(() => {
      importFn().then(resolve)
    }, delay)
  }))
}

// Preload a lazy component
export function preloadLazyComponent<T extends ComponentType<any>>(
  componentPromise: Promise<{ default: T }>
): void {
  componentPromise.then(module => {
    // Cache the module - React will handle this automatically with dynamic import()
    console.log('Component preloaded:', module)
  })
}

// Lazy load with error boundary
import { ErrorInfo, Component, ReactNode } from 'react'

interface LazyLoadState {
  hasError: boolean
  error?: Error
}

export class LazyLoadErrorBoundary extends Component<{ children: ReactNode }, LazyLoadState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): LazyLoadState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lazy load error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load component</Text>
        </View>
      )
    }
    return this.props.children
  }
}

// Cache for lazy-loaded components to avoid re-downloading
const componentCache = new Map<string, Promise<{ default: any }>>()

export async function cachedLazy<T extends ComponentType<any>>(
  key: string,
  importFn: () => Promise<{ default: T }>
): Promise<{ default: T }> {
  if (componentCache.has(key)) {
    return componentCache.get(key)!
  }

  const promise = importFn()
  componentCache.set(key, promise)
  return promise
}

const styles = StyleSheet.create({
  skeleton: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    borderRadius: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
})
