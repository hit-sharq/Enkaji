import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/store'
import { useRBAC } from '@/lib/rbac'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { canAccessAdmin } = useRBAC()
  const [isLoading, setIsLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSellers: 0,
    pendingSellers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const access = canAccessAdmin()
    if (!access.canAccess) {
      Alert.alert('Access Denied', access.message, [
        { text: 'OK', onPress: () => router.back() }
      ])
      setAccessDenied(true)
      setIsLoading(false)
      return
    }
    loadAdminData()
  }

  const loadAdminData = async () => {
    try {
      // Fetch admin statistics
      setStats({
        totalUsers: 0,
        totalSellers: 0,
        pendingSellers: 0,
        totalOrders: 0,
        totalRevenue: 0,
      })
    } catch (error) {
      console.error('[v0] Failed to load admin data:', error)
      Alert.alert('Error', 'Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  if (accessDenied) {
    return null
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    )
  }

  const adminSections = [
    {
      title: 'User Management',
      icon: 'users',
      items: [
        { label: 'All Users', icon: 'users', route: '/admin/users', count: stats.totalUsers },
        { label: 'Sellers', icon: 'shopping-bag', route: '/admin/sellers', count: stats.totalSellers },
        { label: 'Pending Approval', icon: 'clock', route: '/admin/sellers/pending', count: stats.pendingSellers },
      ]
    },
    {
      title: 'Platform Management',
      icon: 'settings',
      items: [
        { label: 'Orders', icon: 'shopping-cart', route: '/admin/orders', count: stats.totalOrders },
        { label: 'Categories', icon: 'grid', route: '/admin/categories', count: 0 },
        { label: 'Reports', icon: 'alert-circle', route: '/admin/reports', count: 0 },
      ]
    },
    {
      title: 'Financial',
      icon: 'dollar-sign',
      items: [
        { label: 'Revenue', icon: 'trending-up', route: '/admin/revenue', count: stats.totalRevenue },
        { label: 'Payouts', icon: 'credit-card', route: '/admin/payouts', count: 0 },
        { label: 'Transactions', icon: 'layers', route: '/admin/transactions', count: 0 },
      ]
    },
  ]

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Feather name="shield" size={32} color={Colors.text.white} />
          </View>
          <Text style={styles.welcomeTitle}>Admin Control Panel</Text>
          <Text style={styles.welcomeSubtitle}>Manage users, sellers, and platform settings</Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <View style={styles.statIconBg}>
              <Feather name="users" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statCount}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconBg}>
              <Feather name="shopping-bag" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statCount}>{stats.totalSellers}</Text>
            <Text style={styles.statLabel}>Sellers</Text>
          </View>
          <View style={styles.statBox}>
            <View style={styles.statIconBg}>
              <Feather name="alert-circle" size={20} color={Colors.warning} />
            </View>
            <Text style={styles.statCount}>{stats.pendingSellers}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Admin Sections */}
        {adminSections.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Feather name={section.icon as any} size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            {section.items.map((item, itemIdx) => (
               <TouchableOpacity
                 key={itemIdx}
                 style={styles.adminItem}
                 onPress={() => router.push(item.route as any)}
               >
                <View style={styles.itemLeft}>
                  <View style={styles.itemIcon}>
                    <Feather name={item.icon as any} size={18} color={Colors.primary} />
                  </View>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                <View style={styles.itemRight}>
                  {item.count > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{item.count}</Text>
                    </View>
                  )}
                  <Feather name="arrow-right" size={18} color={Colors.text.secondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* System Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>System</Text>
          <TouchableOpacity style={styles.adminItem} onPress={() => router.push('/admin/settings' as any)}>
            <View style={styles.itemLeft}>
              <View style={styles.itemIcon}>
                <Feather name="settings" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.itemLabel}>Platform Settings</Text>
            </View>
            <Feather name="arrow-right" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.adminItem} onPress={() => router.push('/admin/logs' as any)}>
            <View style={styles.itemLeft}>
              <View style={styles.itemIcon}>
                <Feather name="file-text" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.itemLabel}>Activity Logs</Text>
            </View>
            <Feather name="arrow-right" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.white,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 8,
  },
  adminItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countBadge: {
    backgroundColor: Colors.warning,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.white,
  },
})
