import { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useOrdersStore } from '@/lib/store'
import { Order } from '@/types'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const STATUS_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  PENDING:    { color: '#F59E0B', icon: 'clock',        label: 'Pending' },
  CONFIRMED:  { color: '#3B82F6', icon: 'check-circle', label: 'Confirmed' },
  PROCESSING: { color: '#8B5CF6', icon: 'loader',       label: 'Processing' },
  SHIPPED:    { color: '#06B6D4', icon: 'truck',        label: 'Shipped' },
  DELIVERED:  { color: '#10B981', icon: 'check-square', label: 'Delivered' },
  CANCELLED:  { color: '#EF4444', icon: 'x-circle',    label: 'Cancelled' },
  REFUNDED:   { color: '#6B7280', icon: 'rotate-ccw',  label: 'Refunded' },
}

function OrderCard({ item, onPress }: { item: Order; onPress: () => void }) {
  const status = STATUS_CONFIG[item.status] ?? { color: '#6B7280', icon: 'circle', label: item.status }

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.cardTop}>
        <View style={styles.orderNumberRow}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
            <Feather name={status.icon as any} size={12} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardBottom}>
        <View>
          <Text style={styles.itemsLabel}>
            {item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}
          </Text>
          <View style={styles.paymentRow}>
            <View
              style={[
                styles.paymentBadge,
                { backgroundColor: item.paymentStatus === 'PAID' ? '#10B981' + '15' : '#F59E0B' + '15' },
              ]}
            >
              <Text
                style={[
                  styles.paymentText,
                  { color: item.paymentStatus === 'PAID' ? '#10B981' : '#F59E0B' },
                ]}
              >
                {item.paymentStatus}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.totalRight}>
          <Text style={styles.totalAmount}>KES {Number(item.total).toLocaleString()}</Text>
          <Feather name="chevron-right" size={18} color={Colors.text.muted} style={styles.chevron} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function OrdersScreen() {
  const router = useRouter()
  const { orders, setOrders, isLoading, setLoading } = useOrdersStore()
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('ALL')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const response = await api.getOrders()
      if (response.success && response.data) {
        setOrders(response.data)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const tabs = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab)

  if (isLoading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          data={tabs}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const count = item === 'ALL' ? orders.length : orders.filter((o) => o.status === item).length
            const isActive = activeTab === item
            return (
              <TouchableOpacity
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(item)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item === 'ALL' ? 'All' : STATUS_CONFIG[item]?.label ?? item}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, isActive && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          }}
        />
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="package" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            {activeTab === 'ALL' ? 'No orders yet' : `No ${STATUS_CONFIG[activeTab]?.label ?? activeTab} orders`}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'ALL' ? 'Your orders will appear here' : 'Check back later'}
          </Text>
          {activeTab === 'ALL' && (
            <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <OrderCard item={item} onPress={() => router.push(`/orders/${item.id}`)} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.text.tertiary,
    fontSize: 14,
  },
  tabsWrapper: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundSecondary,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.text.white,
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.text.secondary,
  },
  tabBadgeTextActive: {
    color: Colors.text.white,
  },
  ordersList: {
    padding: 16,
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTop: {
    padding: 16,
    paddingBottom: 12,
  },
  orderNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
  },
  itemsLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  paymentRow: {
    flexDirection: 'row',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '700',
  },
  totalRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  chevron: {
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  shopButtonText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 15,
  },
})
