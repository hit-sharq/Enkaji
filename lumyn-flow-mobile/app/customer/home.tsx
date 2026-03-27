import { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useDeliveryStore } from '@/lib/store'

const COLORS = { primary: '#8B2635', background: '#f8f9fa' }

export default function CustomerHomeScreen() {
  const router = useRouter()
  const { deliveries } = useDeliveryStore()

  const activeDeliveries = deliveries.filter(
    (d) => ['requested', 'assigned', 'picked_up', 'in_transit'].includes(d.status)
  )

  const handleStartDelivery = () => {
    router.push('/customer/request')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Lumyn Flow</Text>
          <TouchableOpacity onPress={() => router.push('/customer/profile')}>
            <Feather name="user" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={handleStartDelivery}
        >
          <View style={styles.quickActionIcon}>
            <Feather name="plus-circle" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>Request a Delivery</Text>
            <Text style={styles.quickActionSubtitle}>
              Send items anywhere in Nairobi
            </Text>
          </View>
          <Feather name="chevron-right" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {activeDeliveries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Deliveries</Text>
            {activeDeliveries.map((delivery) => (
              <TouchableOpacity
                key={delivery.id}
                style={styles.deliveryCard}
                onPress={() => router.push(`/customer/${delivery.id}`)}
              >
                <View style={styles.deliveryIcon}>
                  <Feather name="package" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryNumber}>{delivery.deliveryNumber}</Text>
                  <Text style={styles.deliveryStatus}>{delivery.status}</Text>
                </View>
                <Text style={styles.deliveryAmount}>
                  KES {delivery.totalAmount.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  title: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: { flex: 1 },
  quickActionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  quickActionSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  section: { paddingHorizontal: 20, marginVertical: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#000', marginBottom: 12 },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  deliveryIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: { flex: 1 },
  deliveryNumber: { fontSize: 14, fontWeight: '700', color: '#000' },
  deliveryStatus: { fontSize: 12, color: '#666', marginTop: 2 },
  deliveryAmount: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
})
