import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { Colors } from '../lib/theme'

export default function PaymentWebViewScreen() {
  const router = useRouter()
  const { url, paymentReference, orderId } = useLocalSearchParams<{ url: string; paymentReference?: string; orderId?: string }>()
  const webViewRef = useRef<WebView>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const loadTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    // Set a timeout for loading the payment page (30 seconds)
    loadTimeoutRef.current = window.setTimeout(() => {
      if (isLoading) {
        setLoadError('Payment page took too long to load. Please check your connection and try again.')
        setIsLoading(false)
      }
    }, 30000)

    return () => {
      if (loadTimeoutRef.current !== null) {
        window.clearTimeout(loadTimeoutRef.current)
      }
    }
  }, [isLoading])

  const handleNavigationChange = (navState: any) => {
    setCanGoBack(navState.canGoBack)

    const currentUrl = navState.url || ''

    try {
      const urlObj = new URL(currentUrl)
      const path = urlObj.pathname
      const searchParams = urlObj.searchParams

      // Skip internal API routes (backend)
      if (path.startsWith('/api/')) {
        return
      }

      // Skip the initial Pesapal callback redirect - payment page will load after this
      // Pesapal sometimes redirects to callback before showing payment iframe
      if (path.startsWith('/api/pesapal/callback') && !searchParams.get('OrderTrackingId')) {
        return
      }

      // Check for payment cancellation in query params
      if (searchParams.has('cancel') || searchParams.get('payment') === 'failed' || searchParams.get('payment') === 'error') {
        router.replace('/(tabs)/cart')
        return
      }

      // Check for successful payment: orders page or payment-success page
      if (path.startsWith('/orders/') || path.startsWith('/payment-success')) {
        // Extract order ID: for /orders/:id the part after slash
        const orderId = path.startsWith('/orders/') ? path.split('/orders/')[1]?.split('?')[0] : searchParams.get('orderId')
        if (orderId) {
          router.replace({
            pathname: '/payment-success',
            params: { orderId }
          })
        } else {
          router.replace('/(tabs)/orders')
        }
        return
      }

      // If we landed on payment-cancelled page
      if (path.startsWith('/payment-cancelled')) {
        router.replace('/(tabs)/cart')
        return
      }
    } catch (e) {
      // URL parsing may fail for some edge cases, ignore
      console.error('Navigation parse error:', e)
      
      // Fallback: if we can't parse URL but we're not on the initial payment URL, go back
      if (currentUrl !== url) {
        handleCancel()
      }
    }
  }

  const handleCancel = () => {
    Alert.alert('Cancel Payment', 'Are you sure you want to cancel this payment?', [
      { text: 'Continue Payment', style: 'cancel' },
      {
        text: 'Cancel',
        style: 'destructive',
        onPress: () => router.replace('/(tabs)/cart'),
      },
    ])
  }

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={60} color={Colors.error} />
        <Text style={styles.errorTitle}>Payment Error</Text>
        <Text style={styles.errorText}>Unable to load payment page.</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: Colors.secondary }]}
            onPress={() => {
              // Reload the webview if webviewRef exists
              if (webViewRef.current) {
                webViewRef.current.reload();
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            if (canGoBack) {
              webViewRef.current?.goBack()
            } else {
              handleCancel()
            }
          }}
        >
          <Feather name="arrow-left" size={22} color={Colors.text.white} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Feather name="lock" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.headerTitle}>Secure Payment</Text>
        </View>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Feather name="x" size={22} color={Colors.text.white} />
        </TouchableOpacity>
      </View>

      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        onLoadStart={() => {
          setIsLoading(true)
          setLoadError(null) // Reset error when loading starts
        }}
        onLoadEnd={() => {
          setIsLoading(false)
          // Clear timeout when page loads successfully
          if (loadTimeoutRef.current !== null) {
            window.clearTimeout(loadTimeoutRef.current)
            loadTimeoutRef.current = null
          }
        }}
        onError={(e) => {
          setIsLoading(false)
          setLoadError('Failed to load payment page. Please check your connection and try again.')
          // Clear timeout on error
          if (loadTimeoutRef.current !== null) {
            window.clearTimeout(loadTimeoutRef.current)
            loadTimeoutRef.current = null
          }
        }}
        onNavigationStateChange={handleNavigationChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading payment page...</Text>
          </View>
        )}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      {!isLoading && loadError && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={60} color={Colors.error} />
          <Text style={styles.errorTitle}>Payment Error</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.retryButtonText}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: Colors.secondary }]}
              onPress={() => {
                // Reload the webview if webviewRef exists
                if (webViewRef.current) {
                  webViewRef.current.reload();
                } else {
                  router.back();
                }
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.white,
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: Colors.background,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  retryButtonText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 16,
  },
})