import { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'
import { Product } from '@/types'
import { ProductCard } from '@/components/ProductCard'
import { LoadingSkeletons } from '@/components/LoadingSkeletons'

export default function CategoryDetailScreen() {
  const router = useRouter()
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const [category, setCategory] = useState<any>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadCategory = useCallback(async () => {
    if (!slug) return
    setIsLoading(true)
    try {
      const res = await api.getCategory(slug as string)
      const cat = res?.category ?? res
      setCategory(cat)
      setProducts(Array.isArray(cat?.products) ? cat.products : [])
    } catch (error) {
      console.error('Failed to load category:', error)
      setCategory(null)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [slug])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadCategory()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Category</Text>
          <View style={{ width: 36 }} />
        </View>
        <LoadingSkeletons count={6} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category?.name || 'Category'}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {category?.description ? (
        <Text style={styles.description}>{category.description}</Text>
      ) : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard
              product={item}
              onPress={(p) => router.push(`/product/${p.id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptySub}>Check back soon for new stock in this category.</Text>
          </View>
        }
      />
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
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  description: { paddingHorizontal: 16, paddingVertical: 8, fontSize: 13, color: Colors.text.tertiary },
  list: { padding: 12, paddingBottom: 24 },
  row: { justifyContent: 'space-between' },
  cardWrap: { width: '48%', marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginTop: 12 },
  emptySub: { fontSize: 13, color: Colors.text.tertiary, marginTop: 4, textAlign: 'center' },
})
