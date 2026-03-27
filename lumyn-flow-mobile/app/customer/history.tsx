import React, { useEffect, useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react-native'
import { lumynApi } from '../../lib/api'

interface Delivery {
  id: string
  deliveryNumber: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  totalAmount: number
  createdAt: string
  driver?: { fullName: string } | null
}

const STATUS_CONFIG: Record<string, { color: string; label: string; Icon: React.ComponentType<{ size?: number; color?: string }> }> = {
  requested:  { color: '#F59E0B', label: 'Searching', Icon: Clock },
  accepted:   { color: '#3B82F6', label: 'Accepted',  Icon: Truck },
  picked_up:  { color: '#8B5CF6', label: 'In Transit', Icon: Truck },
  delivered:  { color: '#10B981', label: 'Delivered',  Icon: CheckCircle },
  cancelled:  { color: '#EF4444', label: 'Cancelled',  Icon: XCircle },
}

export default function DeliveryHistoryScreen() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const fetch = async () => {
    try {
      const res = await lumynApi.getDeliveries()
      setDeliveries(res.data?.deliveries || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const filtered = filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter)

  const renderItem = ({ item }: { item: Delivery }) => {
    const cfg = STATUS_CONFIG[item.status] || { color: '#6B7280', label: item.status, Icon: Package }
    const Ic = cfg.Icon
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/customer/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={[styles.statusPill, { backgroundColor: cfg.color + '20' }]}>
            <Ic size={12} color={cfg.color} />
            <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={styles.deliveryNum}>{item.deliveryNumber}</Text>
        </View>
        <View style={styles.addresses}>
          <View style={styles.addrRow}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.addrText} numberOfLines={1}>{item.pickupAddress}</Text>
          </View>
          <View style={styles.addrLine} />
          <View style={styles.addrRow}>
            <View style={[styles.dot, { backgroundColor: '#8B2635' }]} />
            <Text style={styles.addrText} numberOfLines={1}>{item.dropoffAddress}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <Text style={styles.amount}>KES {item.totalAmount.toLocaleString()}</Text>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'requested', label: 'Pending' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Delivery History</Text>

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[styles.filterBtn, filter === f.key && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8B2635" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Package size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No deliveries yet</Text>
          <TouchableOpacity onPress={() => router.push('/customer/request')} style={styles.requestBtn}>
            <Text style={styles.requestBtnText}>Request a Delivery</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch() }} tintColor="#8B2635" />}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  filterActive: { backgroundColor: '#8B2635', borderColor: '#8B2635' },
  filterText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  deliveryNum: { fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' },
  addresses: { gap: 4, marginBottom: 12 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  addrText: { flex: 1, fontSize: 13, color: '#374151' },
  addrLine: { width: 1, height: 10, backgroundColor: '#D1D5DB', marginLeft: 3 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  amount: { fontSize: 14, fontWeight: '700', color: '#111827' },
  date: { fontSize: 12, color: '#9CA3AF' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
  requestBtn: { backgroundColor: '#8B2635', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  requestBtnText: { color: '#FFFFFF', fontWeight: '600' },
})
