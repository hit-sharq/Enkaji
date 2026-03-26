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
import { useAuth } from '@clerk/clerk-expo'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

export default function FavoritesScreen() {
  const router = useRouter()
  const { isSignedIn } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  const loadFavorites = useCallback(async () => {
    if (!isSignedIn) return
    try {
      const data = await api.getFavorites()
      setFavorites(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isSignedIn])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadFavorites()
    setRefreshing(false)
  }

  const handleRemove = async (productId: string) => {
    Alert.alert('Remove Favourite', 'Remove this item from your favourites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setRemoving(productId)
          try {
            await api.removeFavorite(productId)
            setFavorites((prev) => prev.filter((f) => f.id !== productId))
          } catch {
            Alert.alert('Error', 'Could not remove favourite. Try again.')
          } finally {
            setRemoving(null)
          }
        },
      },
    ])
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Favourites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Feather name="heart" size={60} color={Colors.border} />
          <Text style={styles.emptyTitle}>Sign in to see your favourites</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.ctaText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Favourites</Text>
          <View style={{ width: 40 }} />
        </View>
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Favourites ({favorites.length})</Text>
        <View style={{ width: 40 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="heart" size={60} color={Colors.border} />
          <Text style={styles.emptyTitle}>No favourites yet</Text>
          <Text style={styles.emptySubtitle}>Products you save will appear here</Text>
          <TouchableOpacity style={styles.cta} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.ctaText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.info}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  {item.category?.name && (
                    <Text style={styles.category}>{item.category.name}</Text>
                  )}
                  <Text style={styles.price}>KES {Number(item.price).toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => handleRemove(item.id)}
                disabled={removing === item.id}
              >
                {removing === item.id ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Feather name="trash-2" size={18} color={Colors.error} />
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: { flex: 1, flexDirection: 'row', gap: 12 },
  image: { width: 72, height: 72, borderRadius: 8, backgroundColor: Colors.backgroundSecondary },
  info: { flex: 1, justifyContent: 'center', gap: 4 },
  productName: { fontSize: 14, fontWeight: '600', color: Colors.text.primary },
  category: { fontSize: 12, color: Colors.text.secondary },
  price: { fontSize: 15, fontWeight: '700', color: Colors.primary },
  removeBtn: { padding: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
  cta: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
