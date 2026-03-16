import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

interface SellerStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}

const STAT_CARDS = [
  {
    key: 'totalRevenue',
    label: 'Revenue',
    icon: 'trending-up',
    color: '#10B981',
    format: (v: number) => `KES ${v.toLocaleString()}`,
    route: null,
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: 'shopping-cart',
    color: '#8B5CF6',
    format: (v: number) => String(v),
    route: '/seller/orders',
  },
  {
    key: 'totalProducts',
    label: 'Products',
    icon: 'package',
    color: '#3B82F6',
    format: (v: number) => String(v),
    route: '/seller/products',
  },
  {
    key: 'pendingOrders',
    label: 'Pending',
    icon: 'clock',
    color: '#F59E0B',
    format: (v: number) => String(v),
    route: '/seller/orders',
  },
]

const QUICK_ACTIONS = [
  { icon: 'plus-circle', label: 'Add Product', color: Colors.primary, route: '/seller/products/add' },
  { icon: 'bar-chart-2', label: 'Analytics', color: '#8B5CF6', route: null },
  { icon: 'file-text', label: 'Payouts', color: '#10B981', route: '/seller/payouts' },
  { icon: 'settings', label: 'Settings', color: '#64748B', route: '/settings' },
]

export default function SellerDashboardScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setIsLoading(true)
    try {
      const response = await api.getSellerDashboard()
      if (response.success && response.data) setStats(response.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    )
  }

  const firstName = user?.firstName || 'Seller'

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
      }
    >
      {/* Hero Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcomeLabel}>Welcome back,</Text>
            <Text style={styles.sellerName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.addProductBtn}
            onPress={() => router.push('/seller/products/add')}
          >
            <Feather name="plus" size={20} color={Colors.text.white} />
          </TouchableOpacity>
        </View>
        <Text style={styles.dashboardSubtitle}>Here's what's happening with your store today.</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {STAT_CARDS.map((card) => {
          const value = stats[card.key as keyof SellerStats]
          return (
            <TouchableOpacity
              key={card.key}
              style={styles.statCard}
              onPress={() => card.route ? router.push(card.route) : null}
              activeOpacity={card.route ? 0.85 : 1}
            >
              <View style={[styles.statIconBg, { backgroundColor: card.color + '18' }]}>
                <Feather name={card.icon as any} size={22} color={card.color} />
              </View>
              <Text style={styles.statValue}>{card.format(value)}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
              {card.route && (
                <View style={styles.statArrow}>
                  <Feather name="arrow-right" size={12} color={card.color} />
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={styles.actionItem}
              onPress={() =>
                action.route
                  ? router.push(action.route)
                  : Alert.alert('Coming Soon', `${action.label} coming soon!`)
              }
            >
              <View style={[styles.actionIconBg, { backgroundColor: action.color + '18' }]}>
                <Feather name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/seller/orders')}>
            <Text style={styles.seeAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Feather name="inbox" size={28} color={Colors.text.muted} />
          </View>
          <Text style={styles.emptyStateTitle}>No orders yet</Text>
          <Text style={styles.emptyStateText}>New orders will appear here</Text>
        </View>
      </View>

      {/* Payout Summary */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payout Summary</Text>
          <TouchableOpacity onPress={() => router.push('/seller/payouts')}>
            <Text style={styles.seeAllText}>Details</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.payoutRow}>
          <View style={styles.payoutItem}>
            <Text style={styles.payoutLabel}>Available</Text>
            <Text style={styles.payoutValue}>KES 0</Text>
          </View>
          <View style={styles.payoutDivider} />
          <View style={styles.payoutItem}>
            <Text style={styles.payoutLabel}>Pending</Text>
            <Text style={styles.payoutValue}>KES 0</Text>
          </View>
          <View style={styles.payoutDivider} />
          <View style={styles.payoutItem}>
            <Text style={styles.payoutLabel}>Total Earned</Text>
            <Text style={[styles.payoutValue, { color: '#10B981' }]}>
              KES {stats.totalRevenue.toLocaleString()}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.payoutBtn}>
          <Feather name="credit-card" size={16} color={Colors.text.white} />
          <Text style={styles.payoutBtnText}>Request Payout</Text>
        </TouchableOpacity>
      </View>

      {/* Tips */}
      <View style={[styles.sectionCard, styles.tipCard]}>
        <View style={styles.tipHeader}>
          <Feather name="zap" size={18} color={Colors.gold} />
          <Text style={styles.tipTitle}>Seller Tip</Text>
        </View>
        <Text style={styles.tipText}>
          Products with 3+ images sell 30% faster. Add more photos to boost your sales!
        </Text>
        <TouchableOpacity
          style={styles.tipBtn}
          onPress={() => router.push('/seller/products')}
        >
          <Text style={styles.tipBtnText}>Manage Products</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
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
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  welcomeLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text.white,
  },
  addProductBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 12,
  },
  statCard: {
    width: '46.5%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  statIconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  statArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  sectionCard: {
    backgroundColor: Colors.background,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 14,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: Colors.text.muted,
  },
  payoutRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  payoutItem: {
    flex: 1,
    alignItems: 'center',
  },
  payoutDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  payoutLabel: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginBottom: 4,
    fontWeight: '500',
  },
  payoutValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  payoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  payoutBtnText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 14,
  },
  tipCard: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
    marginBottom: 4,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gold,
  },
  tipText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  tipBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tipBtnText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
})
