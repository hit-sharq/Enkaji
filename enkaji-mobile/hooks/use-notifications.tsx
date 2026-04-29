import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import { notificationService, PushNotification } from '@/lib/notifications'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

interface NotificationContextType {
  notifications: PushNotification[]
  unreadCount: number
  isLoading: boolean
  refresh: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { isSignedIn, userId } = useAuth()
  const router = useRouter()

  const fetchNotifications = async () => {
    if (!isSignedIn) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.data)
        setUnreadCount(data.meta.unread)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    await fetchNotifications()
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'PATCH',
      })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.read)
          .map((n) => markAsRead(n.id))
      )
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  useEffect(() => {
    if (!isSignedIn) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Initialize notification service (permissions, token registration)
    notificationService.initialize()

    // Fetch initial notifications
    fetchNotifications()

    // Poll for new notifications every 30 seconds when app is active
    const interval = setInterval(fetchNotifications, 30000)

    return () => clearInterval(interval)
  }, [isSignedIn, userId])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        refresh,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}
