import { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert 
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

interface SellerStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
}

export default function SellerDashboardScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0
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
      if (response.success && response.data) {
        setStats(response.data)
      }
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

  const menuItems = [
    { 
      icon: 'shopping-bag', 
      label: 'My Products', 
      value: stats.totalProducts,
      color: '#3B82F6',
      onPress: () => router.push('/seller/products')
    },
    { 
      icon: 'shopping-cart', 
      label: 'Orders', 
      value: stats.totalOrders,
      color: '#8B5CF6',
      onPress: () => router.push('/seller/orders')
    },
    { 
      icon: 'dollar-sign', 
      label: 'Revenue', 
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      color: '#10B981',
      onPress: () => {}
    },
    { 
      icon: 'clock', 
      label: 'Pending', 
      value: stats.pendingOrders,
      color: '#F59E0B',
      onPress: () => router.push('/seller/orders?status=pending')
    },
  ]

  const quickActions = [
    { 
      icon: 'plus-circle', 
      label: 'Add Product', 
      onPress: () => router.push('/seller/products/add')
    },
    { 
      icon: 'bar-chart-2', 
      label: 'Analytics', 
      onPress: () => Alert.alert('Coming Soon', 'Analytics coming soon!')
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      onPress: () => router.push('/settings')
    },
    { 
      icon: 'help-circle', 
      label: 'Help', 
      onPress: () => router.push('/help')
    },
  ]

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.sellerName}>
          {user?.firstName || 'Seller'}
        </Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.statCard}
            onPress={item.onPress}
          >
            <View style={[styles.statIcon, { backgroundColor: item.color + '20' }]}>
              <Feather name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.actionCard}
              onPress={action.onPress}
            >
              <Feather name={action.icon as any} size={24} color="#000" />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/seller/orders')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyOrders}>
          <Feather name="package" size={40} color="#ccc" />
          <Text style={styles.emptyOrdersText}>No orders yet</Text>
        </View>
      </View>

      {/* Payout Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payouts</Text>
          <TouchableOpacity onPress={() => router.push('/seller/payouts')}>
            <Text style={styles.seeAllText}>View</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.payoutCard}>
          <Feather name="credit-card" size={24} color="#10B981" />
          <View style={styles.payoutInfo}>
            <Text style={styles.payoutLabel}>Next Payout</Text>
            <Text style={styles.payoutValue}>KES 0.00</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Seller Dashboard v1.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 14,
    color: '#ccc',
  },
  sellerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '50%',
    padding: 10,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '25%',
    alignItems: 'center',
    padding: 10,
  },
  actionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 30,
  },
  emptyOrdersText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
  },
  payoutInfo: {
    marginLeft: 15,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#666',
  },
  payoutValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})

