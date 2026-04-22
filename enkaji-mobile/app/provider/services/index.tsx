import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { ServiceLite } from '@/types'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

interface ProviderService extends ServiceLite {
  isActive: boolean
}

export default function ProviderServicesScreen() {
  const router = useRouter()
  const [services, setServices] = useState<ProviderService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadServices = useCallback(async () => {
    try {
      const response = await api.getMyServices()
      if (response && Array.isArray(response.services)) {
        setServices(response.services)
      } else if (Array.isArray(response)) {
        setServices(response)
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadServices() }, [loadServices])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadServices()
    setRefreshing(false)
  }

  const handleDelete = (service: ProviderService) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(service.id)
            try {
              await api.deleteService(service.id)
              setServices((prev) => prev.filter((s) => s.id !== service.id))
              Alert.alert('Deleted', 'Service has been removed.')
            } catch {
              Alert.alert('Error', 'Failed to delete service. Please try again.')
            } finally {
              setDeletingId(null)
            }
          },
        },
      ]
    )
  }

  const handleToggleActive = async (service: ProviderService) => {
    try {
      await api.updateService(service.id, { isActive: !service.isActive })
      setServices((prev) =>
        prev.map((s) => s.id === service.id ? { ...s, isActive: !s.isActive } : s)
      )
    } catch {
      Alert.alert('Error', 'Failed to update service status.')
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your services...</Text>
      </View>
    )
  }

  const renderService = ({ item }: { item: ProviderService }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/provider/services/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.serviceCategory}>{item.category}</Text>
          <View style={styles.priceDurationRow}>
            <Text style={styles.servicePrice}>KES {item.price.toLocaleString()}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{item.duration} min</Text>
            </View>
            {item.totalReviews > 0 && (
              <View style={styles.ratingBadge}>
                <Feather name="star" size={10} color={Colors.primary} />
                <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.statusToggle, item.isActive && styles.statusToggleActive]}
          onPress={() => handleToggleActive(item)}
        >
          <Text style={[styles.statusToggleText, item.isActive && styles.statusToggleTextActive]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/provider/services/${item.id}`)}
        >
          <Feather name="edit-2" size={16} color={Colors.primary} />
        </TouchableOpacity>

        {deletingId === item.id ? (
          <ActivityIndicator size="small" color={Colors.error} style={styles.actionBtn} />
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item)}>
            <Feather name="trash-2" size={16} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Services</Text>
          <Text style={styles.headerSubtitle}>{services.length} service{services.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/provider/services/add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="briefcase" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No services yet</Text>
          <Text style={styles.emptyText}>Start offering services by adding your first one</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/provider/services/add')}
          >
            <Text style={styles.emptyBtnText}>Add First Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: { flexDirection: 'row', padding: 12 },
  serviceImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: Colors.backgroundLight },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceName: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, lineHeight: 19, marginBottom: 3 },
  serviceCategory: { fontSize: 11, color: Colors.text.tertiary, textTransform: 'uppercase', fontWeight: '600', marginBottom: 6 },
  priceDurationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  servicePrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  durationBadge: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: { fontSize: 11, fontWeight: '600', color: Colors.text.tertiary },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '18',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  ratingText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  statusToggle: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  statusToggleActive: { backgroundColor: Colors.success + '18' },
  statusToggleText: { fontSize: 12, fontWeight: '700', color: Colors.text.tertiary },
  statusToggleTextActive: { color: Colors.success },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '12', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: Colors.text.tertiary, textAlign: 'center', marginBottom: 24 },
  emptyBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})