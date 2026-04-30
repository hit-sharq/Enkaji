import { useCallback, useEffect } from 'react'
import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'

export function useDeepLinking() {
  const router = useRouter()

  const handleUrl = useCallback((url: string) => {
    try {
      console.log('Deep link received:', url)
      
      // Parse deep link
      const parsedUrl = new URL(url)
      
      // Product link: enkaji://product/123 or https://enkaji.vercel.app/product/123
      const path = parsedUrl.pathname
      
      if (path.startsWith('/product/') || url.includes('/product/')) {
        const productId = path.split('/').pop() || parsedUrl.searchParams.get('product')
        if (productId) {
          router.push(`/product/${productId}`)
          return true
        }
      }

      // Category link
      if (path.startsWith('/category/')) {
        const slug = path.split('/').pop()
        if (slug) {
          router.push({ pathname: '/search', params: { category: slug } })
          return true
        }
      }

      // Seller/dashboard
      if (path.startsWith('/seller/') || path.startsWith('/shop/')) {
         const sellerId = path.split('/').pop()
         if (sellerId) {
           router.push(`/seller/${sellerId}` as any)
           return true
         }
      }

      // Messages
      if (path.startsWith('/messages/')) {
         const threadId = path.split('/').pop()
         if (threadId) {
           router.push(`/messages/${threadId}` as any)
           return true
         }
      }

      // Checkout
      if (path.includes('/checkout')) {
        router.push('/checkout')
        return true
      }

      // Notification deep link: ?notificationId=xyz
      const notificationId = parsedUrl.searchParams.get('notificationId')
      if (notificationId) {
        router.push('/notifications')
        return true
      }

      return false
    } catch (error) {
      console.error('Failed to handle deep link:', error)
      return false
    }
  }, [router])

  // Listen for deep links when app is opened from terminated state
  useEffect(() => {
    const linking = Linking.getInitialURL().then(url => {
      if (url) {
        handleUrl(url)
      }
    })

    // Listen for links while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url)
    })

    return () => {
      subscription.remove()
    }
  }, [handleUrl])

  return { handleUrl }
}
