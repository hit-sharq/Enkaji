import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import { Colors } from '@/lib/theme'

interface Notification {
  id: string
  title: string
  body: string
  type: 'order' | 'payment' | 'promo' | 'system'
  read: boolean
  time: string
}

const ICON_MAP: Record<string, any> = {
  order: 'shopping-bag',
  payment: 'credit-card',
  promo: 'tag',
  system: 'bell',
}

const COLOR_MAP: Record<string, string> = {
  order: Colors.primary,
  payment: '#22c55e',
  promo: '#f59e0b',
  system: '#6366f1',
}

export default function NotificationsScreen() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Confirmed',
      body: 'Your order #ORD-001 has been confirmed and is being processed.',
      type: 'order',
      read: false,
      time: '2 hours ago',
    },
    {
      id: '2',
      title: 'Payment Received',
      body: 'Payment of KES 2,500 received for order #ORD-001.',
      type: 'payment',
      read: false,
      time: '2 hours ago',
    },
    {
      id: '3',
      title: 'Welcome to Enkaji!',
      body: 'Thank you for joining Kenya\'s premier B2B marketplace. Start exploring products today.',
      type: 'system',
      read: true,
      time: '1 day ago',
    },
  ])
  const [isLoading] = useState(false)

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Feather name="bell-off" size={60} color={Colors.border} />
          <Text style={styles.emptyTitle}>Sign in to see notifications</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="bell" size={60} color={Colors.border} />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>You'll see order updates and promotions here</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.read && styles.cardUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: COLOR_MAP[item.type] + '20' }]}>
                <Feather name={ICON_MAP[item.type]} size={20} color={COLOR_MAP[item.type]} />
              </View>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {!item.read && <View style={styles.dot} />}
                </View>
                <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  markAll: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: 8 },
  cardBody: { fontSize: 13, color: Colors.text.secondary, marginTop: 3, lineHeight: 18 },
  cardTime: { fontSize: 11, color: Colors.text.tertiary, marginTop: 6 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
})
