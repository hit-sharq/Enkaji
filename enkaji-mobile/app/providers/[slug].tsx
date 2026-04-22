import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useProvidersStore, useServicesStore } from '@/lib/store'
import { ServiceProvider, ServiceLite } from '@/types'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

const SCREEN_WIDTH = Dimensions.get('window').width

export default function ProviderProfileScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{ slug: string }>()

  const { setCurrentProvider, currentProvider, isLoading: providerLoading, setLoading: setProviderLoading } = useProvidersStore()
  const { services, setServices, isLoading: servicesLoading } = useServicesStore()

  const [loading, setLoading] = useState(true)
  const [provider, setProvider] = useState<ServiceProvider | null>(null)

  useEffect(() => {
    if (params.slug) {
      fetchProvider(params.slug)
      fetchProviderServices(params.slug)
    }
  }, [params.slug])

  const fetchProvider = async (slug: string) => {
    setLoading(true)
    setProviderLoading(true)
    try {
      const response: any = await api.getProvider(slug)
      if (response) {
        const providerData = response as ServiceProvider
        setProvider(providerData)
        setCurrentProvider(providerData)
      }
    } catch (error) {
      console.error('Error fetching provider:', error)
    } finally {
      setLoading(false)
      setProviderLoading(false)
    }
  }

  const fetchProviderServices = async (slug: string) => {
    try {
      const response: any = await api.getProviderServices(slug)
      if (response && response.services) {
        setServices(response.services as ServiceLite[])
      }
    } catch (error) {
      console.error('Error fetching provider services:', error)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Feather
            key={star}
            name="star"
            size={14}
            color={star <= rating ? Colors.primary : '#ddd'}
            fill={star <= rating ? Colors.primary : 'none'}
          />
        ))}
      </View>
    )
  }

  const renderServiceCard = ({ item }: { item: ServiceLite }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => router.push(`/services/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
        style={styles.serviceImage}
        resizeMode="cover"
      />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.serviceMeta}>
          <Text style={styles.serviceDuration}>{item.duration} min</Text>
          <Text style={styles.servicePrice}>KSh {item.price.toLocaleString()}</Text>
        </View>
        <View style={styles.serviceRating}>
          {renderStars(Math.round(item.averageRating))}
          <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (loading || providerLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!provider) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Provider not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerBg} />
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {provider.logo ? (
                <Image source={{ uri: provider.logo }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {provider.businessName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
              )}
               {provider.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Feather name="check-circle" size={16} color="#10b981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <Text style={styles.businessName}>{provider.businessName}</Text>

            <View style={styles.ratingRow}>
              {renderStars(Math.round(provider.averageRating))}
              <Text style={styles.ratingText}>
                {provider.averageRating.toFixed(1)} ({provider.totalReviews} reviews)
              </Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{provider.yearsExperience}</Text>
                <Text style={styles.statLabel}>Years Exp.</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{services.length}</Text>
                <Text style={styles.statLabel}>Services</Text>
              </View>
            </View>

            {/* Contact Actions */}
            <View style={styles.contactRow}>
              <TouchableOpacity style={styles.contactButton}>
                <Feather name="phone" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.contactButton, styles.messageButton]}>
                <Feather name="message-circle" size={18} color="#fff" />
                <Text style={styles.contactButtonText}>Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* About */}
        {provider.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.sectionText}>{provider.description}</Text>
          </View>
        )}

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactInfoRow}>
            <Feather name="mail" size={16} color={Colors.text.secondary} />
            <Text style={styles.contactInfoText}>{provider.email}</Text>
          </View>
          <View style={styles.contactInfoRow}>
            <Feather name="phone" size={16} color={Colors.text.secondary} />
            <Text style={styles.contactInfoText}>{provider.phone}</Text>
          </View>
          <View style={styles.contactInfoRow}>
            <Feather name="map-pin" size={16} color={Colors.text.secondary} />
            <Text style={styles.contactInfoText}>
              {provider.location}, {provider.city}, {provider.county}
            </Text>
          </View>
        </View>

        {/* Services Offered */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Text style={styles.servicesCount}>{services.length} services</Text>
          </View>
          {servicesLoading ? (
            <View style={styles.loadingServices}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : services.length === 0 ? (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyServicesText}>No services listed yet</Text>
            </View>
          ) : (
            <FlatList
              data={services}
              keyExtractor={(item) => item.id}
              renderItem={renderServiceCard}
              scrollEnabled={false}
              numColumns={2}
              contentContainerStyle={styles.servicesGrid}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Now CTA (sticky) */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/services' as any)}
      >
        <Text style={styles.ctaButtonText}>View All Services</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  backLink: {
    color: Colors.primary,
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    position: 'relative',
  },
  headerBg: {
    height: 180,
    backgroundColor: Colors.primary,
  },
  profileSection: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    gap: 2,
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: '600',
  },
  businessName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
    marginRight: 6,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 24,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  messageButton: {
    backgroundColor: '#10b981',
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    borderBottomWidth: 8,
    borderBottomColor: Colors.background,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111',
  },
  servicesCount: {
    fontSize: 14,
    color: '#666',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#444',
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactInfoText: {
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  loadingServices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyServices: {
    padding: 40,
    alignItems: 'center',
  },
  emptyServicesText: {
    color: '#999',
    fontStyle: 'italic',
  },
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    maxWidth: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
    marginBottom: 12,
  },
  serviceImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f3f4f6',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    lineHeight: 18,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceDuration: {
    fontSize: 12,
    color: '#888',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  serviceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
