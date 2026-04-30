import { useEffect } from 'react'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import * as Notifications from 'expo-notifications'
import { useAuthStore } from '@/lib/store'

const prefix = Linking.createURL('/')

export const linking = {
  prefixes: [prefix, 'enkaji://', 'https://enkaji.app'],
  config: {
    screens: {
      // Auth routes
      '(auth)/sign-in': 'auth/signin',
      '(auth)/sign-up': 'auth/signup',
      '(auth)/reset-password': 'auth/reset-password',

      // Tab routes
      '(tabs)': {
        screens: {
          index: 'home',
          search: 'search',
          cart: 'cart',
          orders: 'orders',
          profile: 'profile',
        },
      },

      // Product routes
      'product/[id]': 'product/:id',
      'categories/[slug]': 'category/:slug',

      // Checkout routes
      checkout: 'checkout',
      'payment-webview': 'payment',
      'payment-success': 'payment/success',
      'payment-cancelled': 'payment/cancelled',

      // Seller routes
      'seller/dashboard': 'seller/dashboard',
      'seller/products': 'seller/products',
      'seller/orders': 'seller/orders',
      'seller/analytics': 'seller/analytics',
      'seller/payouts': 'seller/payouts',

      // Admin routes
      'admin/dashboard': 'admin/dashboard',
      'admin/users': 'admin/users',
      'admin/sellers': 'admin/sellers',
      'admin/orders': 'admin/orders',

      // User routes
      favorites: 'favorites',
      'shipping-addresses': 'addresses',
      notifications: 'notifications',
      settings: 'settings',
      help: 'help',
    },
  },
}

export function useDeepLinkingEnhanced() {
  const router = useRouter()
  const { user } = useAuthStore()

  useEffect(() => {
    const handleNotificationResponse = async (response: Notifications.NotificationResponse) => {
      const { data } = response.notification.request.content
      
      if (data.type === 'order') {
        router.push(`/product/${data.productId}`)
      } else if (data.type === 'seller_order') {
        router.push('/seller/orders')
       } else if (data.type === 'admin_alert') {
         router.push('/admin/dashboard' as any)
       } else if (data.link) {
         router.push(data.link as any)
       }
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse)

    return () => subscription.remove()
  }, [router])

   useEffect(() => {
     const handleDeepLink = async ({ url }: { url: string }) => {
       const route = url.replace(/.*?\/\//g, '')
       
       // Check permissions based on user role
       if (route.startsWith('seller/') && user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
         console.warn('[v0] Unauthorized access to seller route')
         return
       }
       
       if (route.startsWith('admin/') && user?.role !== 'ADMIN') {
         console.warn('[v0] Unauthorized access to admin route')
         return
       }

       router.push(route as any)
     }

     const subscription = Linking.addEventListener('url', handleDeepLink)

     ;(async () => {
       const initialUrl = await Linking.getInitialURL()
       if (initialUrl != null) {
         handleDeepLink({ url: initialUrl })
       }
     })()

     return () => subscription.remove()
   }, [router, user])
}

// Helper function to generate deep links
export function generateDeepLink(path: string, params?: Record<string, any>): string {
  const baseUrl = Linking.createURL('')
  const query = params ? `?${new URLSearchParams(params).toString()}` : ''
  return `${baseUrl}${path}${query}`
}

// Share deep link
export async function shareDeepLink(path: string, title: string) {
  const link = generateDeepLink(path)
  
  try {
    await Linking.openURL(`mailto:?subject=${title}&body=${link}`)
  } catch (error) {
    console.error('[v0] Failed to share deep link:', error)
  }
}
