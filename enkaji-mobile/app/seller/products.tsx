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
import { Product } from '@/types'
import { Colors, PLACEHOLDER_IMAGE } from '@/lib/theme'

export default function SellerProductsScreen() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      const response = await api.getSellerProducts()
      if (response.success && response.data) {
        setProducts(response.data)
      } else if (Array.isArray(response)) {
        setProducts(response)
      } else if (response.products) {
        setProducts(response.products)
      }
    } catch (error) {
      console.error('Error loading seller products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const onRefresh = async () => {
    setRefreshing(true)
    await loadProducts()
    setRefreshing(false)
  }

  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(product.id)
            try {
              await api.deleteProduct(product.id)
              setProducts((prev) => prev.filter((p) => p.id !== product.id))
              Alert.alert('Deleted', 'Product has been removed.')
            } catch {
              Alert.alert('Error', 'Failed to delete product. Please try again.')
            } finally {
              setDeletingId(null)
            }
          },
        },
      ]
    )
  }

  const handleToggleActive = async (product: Product) => {
    try {
      await api.updateProduct(product.id, { isActive: !product.isActive })
      setProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, isActive: !p.isActive } : p)
      )
    } catch {
      Alert.alert('Error', 'Failed to update product status.')
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your products...</Text>
      </View>
    )
  }

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/product/${item.id}`)}
        activeOpacity={0.85}
      >
        <Image
          source={{ uri: item.images?.[0] || PLACEHOLDER_IMAGE }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category?.name}</Text>
          <View style={styles.priceStockRow}>
            <Text style={styles.productPrice}>KES {item.price.toLocaleString()}</Text>
            <View style={[styles.stockBadge, item.inventory <= 5 && { backgroundColor: Colors.error + '18' }]}>
              <Text style={[styles.stockText, item.inventory <= 5 && { color: Colors.error }]}>
                {item.inventory} in stock
              </Text>
            </View>
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
          onPress={() => router.push(`/seller/products/edit?id=${item.id}`)}
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
          <Text style={styles.headerTitle}>My Products</Text>
          <Text style={styles.headerSubtitle}>{products.length} listing{products.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/seller/products/add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Feather name="package" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No products yet</Text>
          <Text style={styles.emptyText}>Start selling by adding your first product</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => router.push('/seller/products/add')}
          >
            <Text style={styles.emptyBtnText}>Add First Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
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
  productImage: { width: 80, height: 80, borderRadius: 10, backgroundColor: Colors.backgroundLight },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, lineHeight: 19, marginBottom: 3 },
  productCategory: { fontSize: 11, color: Colors.text.tertiary, textTransform: 'uppercase', fontWeight: '600', marginBottom: 6 },
  priceStockRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  productPrice: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  stockBadge: {
    backgroundColor: Colors.success + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockText: { fontSize: 11, fontWeight: '600', color: Colors.success },
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
