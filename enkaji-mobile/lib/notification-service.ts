import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

export interface NotificationPayload {
  type: 'order' | 'payment' | 'seller_order' | 'admin_alert' | 'message' | 'promotion'
  title: string
  body: string
  data?: Record<string, any>
  delay?: number
}

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    // Process notification
    console.log('[v0] Notification received:', notification)
    
    return {
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }
  },
})

export class NotificationService {
   static async registerForPushNotifications() {
     try {
       const { status: existingStatus } = await Notifications.getPermissionsAsync()
       let finalStatus = existingStatus

       if (existingStatus !== 'granted') {
         const { status } = await Notifications.requestPermissionsAsync()
         finalStatus = status
       }

       if (finalStatus !== 'granted') {
         console.warn('[v0] Permission not granted for notifications')
         return null
       }

       // Get the token
       const token = (
         await Notifications.getExpoPushTokenAsync({
           projectId: Constants.expoConfig?.extra?.eas?.projectId,
         })
       ).data

       console.log('[v0] Push token:', token)
       return token
     } catch (error) {
       console.error('[v0] Failed to register for push notifications:', error)
       return null
     }
   }

   static async sendNotification(payload: NotificationPayload) {
     try {
       const schedulingOptions: Notifications.NotificationRequestInput = {
         content: {
           title: payload.title,
           body: payload.body,
           data: {
             type: payload.type,
             ...payload.data,
           },
           sound: 'default',
           badge: 1,
         },
         trigger: payload.delay ? {
           type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
           seconds: payload.delay,
         } : null,
       }

      const notificationId = await Notifications.scheduleNotificationAsync(schedulingOptions)
      console.log('[v0] Notification scheduled:', notificationId)
      return notificationId
    } catch (error) {
      console.error('[v0] Failed to send notification:', error)
      return null
    }
  }

  // Notification types
  static async notifyOrderConfirmation(orderId: string, status: string) {
    return this.sendNotification({
      type: 'order',
      title: 'Order Confirmed! ✓',
      body: `Your order #${orderId} has been confirmed`,
      data: {
        orderId,
        status,
        link: `/product/${orderId}`,
      },
    })
  }

  static async notifyPaymentSuccess(orderId: string, amount: number) {
    return this.sendNotification({
      type: 'payment',
      title: 'Payment Successful! 💰',
      body: `Payment of KES ${amount} received for order #${orderId}`,
      data: { orderId, amount },
    })
  }

  static async notifySellerOrder(orderId: string, productName: string) {
    return this.sendNotification({
      type: 'seller_order',
      title: 'New Order! 📦',
      body: `You have a new order: ${productName}`,
      data: { orderId, productName },
    })
  }

  static async notifyAdminApprovalPending(count: number) {
    return this.sendNotification({
      type: 'admin_alert',
      title: 'Seller Approvals Pending',
      body: `You have ${count} seller accounts pending approval`,
      data: { count },
    })
  }

  static async notifyPromotion(title: string, description: string) {
    return this.sendNotification({
      type: 'promotion',
      title,
      body: description,
      data: { link: '/home' },
    })
  }

  static async notifyShipmentUpdate(orderId: string, status: string) {
    const statusMessages: Record<string, string> = {
      processing: 'Your order is being prepared',
      shipped: 'Your order has been shipped',
      in_transit: 'Your order is on the way',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    }

    return this.sendNotification({
      type: 'order',
      title: 'Shipment Update 📦',
      body: statusMessages[status] || 'Order status updated',
      data: { orderId, status },
    })
  }

   // Register device token with backend
   static async registerDeviceToken(token: string) {
     try {
       await api.registerNotificationToken(token, Platform.OS)
       console.log('[v0] Device token registered with backend')
     } catch (error) {
       console.error('[v0] Failed to register device token:', error)
     }
   }

  // Cancel notification
  static async cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId)
      console.log('[v0] Notification cancelled:', notificationId)
    } catch (error) {
      console.error('[v0] Failed to cancel notification:', error)
    }
  }

  // Cancel all notifications
  static async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync()
      console.log('[v0] All notifications cancelled')
    } catch (error) {
      console.error('[v0] Failed to cancel all notifications:', error)
    }
  }
}

// Setup function to be called on app initialization
export async function initializeNotifications() {
  try {
    const token = await NotificationService.registerForPushNotifications()
    
    if (token) {
      await NotificationService.registerDeviceToken(token)
      
      // Test notification
      await NotificationService.sendNotification({
        type: 'message',
        title: 'Welcome to Enkaji!',
        body: 'You are all set to receive notifications',
        delay: 1,
      })
    }
  } catch (error) {
    console.error('[v0] Failed to initialize notifications:', error)
  }
}
