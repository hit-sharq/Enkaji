import { useState, useEffect, useCallback } from 'react'
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
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Order } from '@/types'
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

const TABS = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function SellerOrdersScreen() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  const loadOrders = useCallback(async () => {
    try {
      const response = await api.getOrders()
      if (response.success && response.data) setOrders(response.data)
      else if (Array.isArray(response)) setOrders(response)
    } catch (error) {
      console.error('Error loading seller orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadOrders() }, [loadOrders])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadOrders()
    setRefreshing(false)
  }

  const filteredOrders = activeTab === 'ALL' ? orders : orders.filter((o) => o.status === activeTab)

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    )
  }

  const renderOrder = ({ item }: { item: Order }) => {
    const status = STATUS_CONFIG[item.status] ?? { color: '#6B7280', icon: 'circle', label: item.status }
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => router.push(`/orders/${item.id}`)}
        activeOpacity={0.88}
      >
        <View style={styles.orderTop}>
          <View style={styles.orderNumberRow}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.color + '18' }]}>
              <Feather name={status.icon as any} size={11} color={status.color} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View style={styles.orderDivider} />
        <View style={styles.orderBottom}>
          <View>
            <Text style={styles.customerName}>
              {item.user?.firstName ? `${item.user.firstName} ${item.user.lastName || ''}` : 'Customer'}
            </Text>
            <Text style={styles.itemsText}>{item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.orderRight}>
            <Text style={styles.orderAmount}>KES {Number(item.total).toLocaleString()}</Text>
            <Feather name="chevron-right" size={16} color={Colors.text.muted} />
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customer Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} total order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <FlatList
          horizontal
          data={TABS}
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
                    <Text style={[styles.tabBadgeText, isActive && styles.tabBadgeTextActive]}>{count}</Text>
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
            <Feather name="inbox" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'ALL' ? 'Orders from customers will appear here' : `No ${STATUS_CONFIG[activeTab]?.label ?? activeTab} orders`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundSecondary },
  loadingText: { marginTop: 12, color: Colors.text.tertiary, fontSize: 14 },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabsWrapper: { backgroundColor: Colors.background, borderBottomWidth: 1, borderBottomColor: Colors.backgroundSecondary },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
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
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
  tabTextActive: { color: '#fff' },
  tabBadge: { marginLeft: 6, backgroundColor: Colors.border, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.text.secondary },
  tabBadgeTextActive: { color: '#fff' },
  list: { padding: 16, gap: 12 },
  orderCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  orderTop: { padding: 14, paddingBottom: 10 },
  orderNumberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNumber: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700', marginLeft: 4 },
  orderDate: { fontSize: 12, color: Colors.text.tertiary },
  orderDivider: { height: 1, backgroundColor: Colors.backgroundSecondary },
  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingTop: 10 },
  customerName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 2 },
  itemsText: { fontSize: 12, color: Colors.text.tertiary },
  orderRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderAmount: { fontSize: 17, fontWeight: '800', color: Colors.primary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '12', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.text.tertiary, textAlign: 'center' },
})
