import { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const ADMIN_ROLES = ['ADMIN', 'MODERATOR', 'SUPPORT_AGENT', 'CONTENT_MANAGER', 'FINANCE_MANAGER', 'REGIONAL_MANAGER']

export default function AdminPanelScreen() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = user?.role && ADMIN_ROLES.includes(user.role)

  useEffect(() => {
    if (isAdmin) loadStats()
    else setIsLoading(false)
  }, [isAdmin])

  const loadStats = async () => {
    try {
      const data = await api.getAdminStats()
      setStats(data)
    } catch (err) {
      console.error('Error loading admin stats:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.denied}>
          <Feather name="lock" size={60} color={Colors.border} />
          <Text style={styles.deniedTitle}>Access Denied</Text>
          <Text style={styles.deniedText}>You need admin privileges to access this panel.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Feather name={icon} size={24} color={color} />
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  const AdminLink = ({ icon, label, desc, onPress }: any) => (
    <TouchableOpacity style={styles.link} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.linkIcon}>
        <Feather name={icon} size={20} color={Colors.primary} />
      </View>
      <View style={styles.linkContent}>
        <Text style={styles.linkLabel}>{label}</Text>
        <Text style={styles.linkDesc}>{desc}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={Colors.text.tertiary} />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <View style={[styles.roleBadge]}>
          <Text style={styles.roleBadgeText}>{user?.role}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Platform Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="users" label="Total Users" value={stats?.totalUsers} color="#6366f1" />
              <StatCard icon="shopping-bag" label="Total Orders" value={stats?.totalOrders} color={Colors.primary} />
              <StatCard icon="package" label="Products" value={stats?.totalProducts} color="#22c55e" />
              <StatCard icon="dollar-sign" label="Revenue (KES)" value={stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '—'} color="#f59e0b" />
            </View>

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.linksCard}>
              <AdminLink
                icon="package"
                label="Pending Product Approvals"
                desc="Review and approve new products"
                onPress={() => Alert.alert('Admin', 'Use the web admin panel to manage product approvals at /admin/products')}
              />
              <View style={styles.divider} />
              <AdminLink
                icon="users"
                label="Manage Users"
                desc="View, edit and assign user roles"
                onPress={() => Alert.alert('Admin', 'Use the web admin panel to manage users at /admin/users')}
              />
              <View style={styles.divider} />
              <AdminLink
                icon="star"
                label="Review Moderation"
                desc="Moderate flagged or pending reviews"
                onPress={() => Alert.alert('Admin', 'Use the web admin panel to manage reviews at /admin/reviews')}
              />
              <View style={styles.divider} />
              <AdminLink
                icon="credit-card"
                label="Payouts"
                desc="Approve seller payout requests"
                onPress={() => Alert.alert('Admin', 'Use the web admin panel to manage payouts at /admin/payouts')}
              />
              <View style={styles.divider} />
              <AdminLink
                icon="bar-chart-2"
                label="Full Admin Dashboard"
                desc="Open complete admin panel in browser"
                onPress={() => Alert.alert('Admin', 'Visit the web app\'s /admin dashboard for full control.')}
              />
            </View>
          </>
        )}
      </ScrollView>
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
    backgroundColor: Colors.primary,
  },
  back: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  roleBadgeText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.text.primary },
  statLabel: { fontSize: 12, color: Colors.text.secondary, textAlign: 'center' },
  linksCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  link: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: { flex: 1 },
  linkLabel: { fontSize: 15, fontWeight: '600', color: Colors.text.primary },
  linkDesc: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  deniedTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary },
  deniedText: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
})
