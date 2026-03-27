import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useDriverStore } from '@/lib/store'
import api from '@/lib/api'

const COLORS = { primary: '#8B2635', background: '#f8f9fa', success: '#10B981' }

export default function DriverHomeScreen() {
  const router = useRouter()
  const { availableJobs, setAvailableJobs } = useDriverStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAvailableJobs()
    const interval = setInterval(loadAvailableJobs, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAvailableJobs = async () => {
    try {
      const response = await api.getAvailableJobs()
      if (response.success && response.data) {
        setAvailableJobs(response.data)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    try {
      await api.acceptDelivery(jobId)
      router.push(`/driver/active/${jobId}`)
    } catch (error) {
      alert('Failed to accept job. Please try again.')
    }
  }

  const renderJob = ({ item }: { item: any }) => (
    <View style={styles.jobCard}>
      <View style={styles.jobContent}>
        <View style={styles.jobIconBg}>
          <Feather name="map-pin" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobLocation} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
          <Text style={styles.jobDistance}>
            ~{item.distanceKm?.toFixed(1) || '?'} km away
          </Text>
          <View style={styles.jobFooter}>
            <Text style={styles.jobPrice}>KES {item.totalAmount.toLocaleString()}</Text>
            <Text style={styles.jobItemCount}>{item.itemDescription}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.acceptBtn}
        onPress={() => handleAcceptJob(item.id)}
      >
        <Text style={styles.acceptBtnText}>Accept</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Available Jobs</Text>
          <Text style={styles.subtitle}>
            {availableJobs.length} job{availableJobs.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/driver/profile')}>
          <Feather name="user" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : availableJobs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="inbox" size={48} color={COLORS.primary} />
          <Text style={styles.emptyTitle}>No jobs available</Text>
          <Text style={styles.emptyText}>Check back soon or adjust your location</Text>
        </View>
      ) : (
        <FlatList
          data={availableJobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#000' },
  subtitle: { fontSize: 13, color: '#666', marginTop: 2 },
  list: { padding: 16, gap: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center' },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobContent: { flexDirection: 'row', flex: 1, gap: 12 },
  jobIconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: { flex: 1 },
  jobLocation: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
  jobDistance: { fontSize: 12, color: '#666', marginBottom: 6 },
  jobFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  jobPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  jobItemCount: { fontSize: 11, color: '#666' },
  acceptBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
})
