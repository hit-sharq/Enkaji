import { LinkingOptions } from '@react-navigation/native'
import { Text } from 'react-native'
import { routeNames } from '@/navigation/route-names'

export type AppRoute = 
  | '/'
  | '/product/[id]'
  | '/seller/[id]'
  | '/category/[slug]'
  | '/checkout'
  | '/messages'
  | '/notifications'

export const linking: LinkingOptions = {
  prefixes: [
    'https://enkaji.vercel.app',
    'https://www.enkaji.vercel.app',
    'enkaji://',
  ],
  config: {
    screens: {
      root: {
        screens: {
          home: '',
          search: 'search',
          cart: 'cart',
          seller: {
            screens: {
              products: 'seller/products',
              'product/new': 'seller/product/new',
              'product/[id]': 'seller/product/:id',
              orders: 'seller/orders',
              bookings: 'seller/bookings',
            },
          },
          messages: {
            screens: {
              '[id]': 'messages/:id',
            },
          },
          notifications: 'notifications',
          settings: 'settings',
          product: 'product/:id',
          category: 'category/:slug',
          checkout: 'checkout',
        },
      },
    },
  },
  getStateFromPath: (path, config) => {
    // Normalize path (remove trailing slashes, decode URI)
    const normalized = path.replace(/\/+$/, '').toLowerCase()
    
    // Product link: /product/123 or /p/123 or ?product=123
    const productMatch = normalized.match(/\/product\/([^/]+)/) || normalized.match(/\/p\/([^/]+)/)
    if (productMatch) {
      return {
        routes: [
          { name: 'root' },
          { name: 'product', params: { id: productMatch[1] } },
        ],
      }
    }

    // Seller dashboard: /seller/123 or /shop/123
    const sellerMatch = normalized.match(/\/seller\/([^/]+)/) || normalized.match(/\/shop\/([^/]+)/)
    if (sellerMatch) {
      return {
        routes: [
          { name: 'root' },
          { 
            name: 'seller', 
            params: { initialTab: 'products' },
            state: {
              routes: [
                { name: 'products' },
                { name: 'product/[id]', params: { id: sellerMatch[1] } }
              ]
            }
          },
        ],
      }
    }

    // Category: /category/electronics
    const categoryMatch = normalized.match(/\/category\/([^/]+)/)
    if (categoryMatch) {
      return {
        routes: [
          { name: 'root' },
          { name: 'search', params: { category: categoryMatch[1] } },
        ],
      }
    }

    // Messages thread: /messages/123
    const messageMatch = normalized.match(/\/messages\/([^/]+)/)
    if (messageMatch) {
      return {
        routes: [
          { name: 'root' },
          { name: 'messages', state: { routes: [{ name: '[id]', params: { id: messageMatch[1] } }] } },
        ],
      }
    }

    // Checkout direct link
    if (normalized.includes('/checkout')) {
      return {
        routes: [
          { name: 'root' },
          { name: 'cart' },
          { name: 'checkout' },
        ],
      }
    }

    // Fallback to default parsing
    return undefined
  },
}

// Handle incoming links and navigation
export function handleIncomingLink(url: string) {
  try {
    const parsed = new URL(url)
    
    // Product from query param: ?product=123
    const productId = parsed.searchParams.get('product')
    if (productId) {
      return { screen: 'product', params: { id: productId } }
    }

    // Order confirmation: ?order=123
    const orderId = parsed.searchParams.get('order')
    if (orderId) {
      return { screen: 'orders', params: { orderId } }
    }

    // Notification deep link: notificationId=123
    const notificationId = parsed.searchParams.get('notificationId')
    if (notificationId) {
      return { screen: 'notifications', params: { highlight: notificationId } }
    }

    return null
  } catch (error) {
    console.error('Failed to parse deep link:', error)
    return null
  }
}
