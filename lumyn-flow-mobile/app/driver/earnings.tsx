import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import api from '@/lib/api'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', border: '#e0e0e0', green: '#10b981' }

type Period = 'today' | 'week' | 'month' | 'all'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-KE', { dateStyle: 'medium' })
}

export default function EarningsScreen() {
  const router = useRouter()
  const [driver, setDriver] = useState<any>(null)
  const [earnings, setEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>('week')

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await api.client.get('/api/lumyn/drivers/me?earnings=true')
        if (result.data.success) {
          setDriver(result.data.data)
          setEarnings(result.data.data.earnings || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const filterEarnings = () => {
    if (!earnings.length) return []
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    switch (period) {
      case 'today': return earnings.filter((e) => new Date(e.createdAt) >= startOfDay)
      case 'week': return earnings.filter((e) => new Date(e.createdAt) >= startOfWeek)
      case 'month': return earnings.filter((e) => new Date(e.createdAt) >= startOfMonth)
      default: return earnings
    }
  }

  const filtered = filterEarnings()
  const periodTotal = filtered.reduce((sum, e) => sum + e.amount, 0)
  const pendingAmount = earnings.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroLabel}>Total Earned (All Time)</Text>
          <Text style={styles.heroAmount}>KES {(driver?.totalEarnings || 0).toLocaleString()}</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Feather name="truck" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroStatText}>{driver?.totalDeliveries || 0} deliveries</Text>
            </View>
            <View style={styles.heroStat}>
              <Feather name="star" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroStatText}>{driver?.rating?.toFixed(1) || '—'} rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Feather name="clock" size={16} color="#f59e0b" />
            <Text style={styles.summaryLabel}>Pending Payout</Text>
            <Text style={styles.summaryValue}>KES {pendingAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Feather name="trending-up" size={16} color={COLORS.green} />
            <Text style={styles.summaryLabel}>Period Total</Text>
            <Text style={styles.summaryValue}>KES {periodTotal.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {(['today', 'week', 'month', 'all'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, period === p && styles.tabActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.tabText, period === p && styles.tabTextActive]}>
                {p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'Month' : 'All Time'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {filtered.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={32} color="#ccc" />
              <Text style={styles.emptyText}>No earnings for this period</Text>
            </View>
          ) : (
            filtered.map((earning) => (
              <View key={earning.id} style={styles.earningRow}>
                <View style={styles.earningIcon}>
                  <Feather name="package" size={16} color={COLORS.primary} />
                </View>
                <View style={styles.earningInfo}>
                  <Text style={styles.earningDelivery}>Delivery #{earning.deliveryId?.slice(-6)}</Text>
                  <Text style={styles.earningDate}>{formatDate(earning.createdAt)}</Text>
                </View>
                <View style={styles.earningRight}>
                  <Text style={styles.earningAmount}>+KES {earning.amount.toLocaleString()}</Text>
                  <View style={[styles.earningStatus, { backgroundColor: earning.status === 'paid' ? COLORS.green + '20' : '#fef3c7' }]}>
                    <Text style={[styles.earningStatusText, { color: earning.status === 'paid' ? COLORS.green : '#92400e' }]}>
                      {earning.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.payoutNote}>
          <Feather name="info" size={14} color={COLORS.primary} />
          <Text style={styles.payoutNoteText}>Payouts are processed every Friday directly to your registered bank account.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#000' },
  heroBanner: { backgroundColor: COLORS.primary, padding: 24, alignItems: 'center', paddingTop: 32, paddingBottom: 36 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  heroAmount: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 14 },
  heroStats: { flexDirection: 'row', gap: 20 },
  heroStat: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  heroStatText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 12, padding: 16, marginTop: -20 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'flex-start', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  summaryLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginTop: 2 },
  summaryValue: { fontSize: 16, fontWeight: '800', color: '#000' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  tab: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 11, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#fff' },
  section: { paddingHorizontal: 16, gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 4 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 30, alignItems: 'center', gap: 10 },
  emptyText: { fontSize: 14, color: '#aaa' },
  earningRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, gap: 12 },
  earningIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary + '12', justifyContent: 'center', alignItems: 'center' },
  earningInfo: { flex: 1 },
  earningDelivery: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 2 },
  earningDate: { fontSize: 12, color: '#888' },
  earningRight: { alignItems: 'flex-end', gap: 4 },
  earningAmount: { fontSize: 14, fontWeight: '800', color: COLORS.green },
  earningStatus: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  earningStatusText: { fontSize: 11, fontWeight: '600' },
  payoutNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', margin: 16, backgroundColor: COLORS.primary + '10', borderRadius: 10, padding: 12 },
  payoutNoteText: { flex: 1, fontSize: 12, color: COLORS.primary, lineHeight: 18 },
})
