import * as Notifications from 'expo-notifications'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import api from '@/lib/api'

// Configure notification behavior (when app is in foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export type NotificationType = 'order' | 'payment' | 'promo' | 'system' | 'message' | 'booking'

export interface PushNotification {
  id: string
  title: string
  body: string
  type: NotificationType
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

class NotificationService {
  pushToken: string | null = null
  listeners: Array<() => void> = []

  async initialize() {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted')
      return false
    }

    // Get push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      experienceId: '@hit-sharq/enkaji-mobile',
    })
    this.pushToken = tokenData.data

    // Register token with backend (if user is logged in)
    await this.registerTokenWithBackend()

    // Set up notification listeners
    this.setupListeners()

    // Set badge count to 0 on startup
    await Notifications.setBadgeCountAsync(0)

    return true
  }

  private async registerTokenWithBackend() {
    try {
      await api.post('/api/notifications/token', {
        token: this.pushToken,
        platform: Platform.OS,
      })
    } catch (error) {
      console.warn('Failed to register push token:', error)
    }
  }

  private setupListeners() {
    // Listener for notifications received while app is foregrounded
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification)
      this.updateBadgeCount()
    })

    // Listener for user tapping on notification - handles deep linking
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('User tapped notification:', response)
      this.handleNotificationTap(response.notification)
    })

    this.listeners.push(
      () => receivedSubscription.remove(),
      () => responseSubscription.remove()
    )
  }

  private async handleNotificationTap(notification: Notifications.Notification) {
    const data = notification.request.content.data
    
    // Build deep link URL based on notification type
    let url = '/'
    if (data.type === 'order') {
      url = `/orders/${data.orderId || ''}`
    } else if (data.type === 'message') {
      url = `/messages/${data.threadId || ''}`
    } else if (data.type === 'product') {
      url = `/product/${data.productId || ''}`
    } else if (data.url) {
      url = data.url
    }

    // Use Linking to navigate (works with deep linking setup)
    const deepLink = Linking.createURL(url)
    Linking.openURL(deepLink).catch(err => {
      console.error('Failed to open deep link:', err)
    })
  }

  private async updateBadgeCount() {
    try {
      const response = await api.get<{ count: number }>('/api/notifications/unread-count')
      await Notifications.setBadgeCountAsync(response.count)
    } catch (error) {
      console.warn('Failed to update badge count:', error)
    }
  }

  async scheduleLocalNotification(title: string, body: string, data?: Record<string, any>, secondsFromNow = 1) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: { seconds: secondsFromNow },
    })
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync()
    await Notifications.setBadgeCountAsync(0)
  }

  getPushToken(): string | null {
    return this.pushToken
  }

  destroy() {
    this.listeners.forEach((cleanup) => cleanup())
    this.listeners = []
  }
}

export const notificationService = new NotificationService()
