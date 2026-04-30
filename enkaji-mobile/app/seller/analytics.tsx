import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuthStore, useAnalyticsStore } from '@/lib/store'
import { useRBAC } from '@/lib/rbac'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

export default function SellerAnalytics() {
  const router = useRouter()
  const { canAccessSeller } = useRBAC()
  const { salesData, revenueSummary, ordersData, isLoading, setLoading } = useAnalyticsStore()
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month')
  const [analyticsData, setAnalyticsData] = useState({
    views: 0,
    clicks: 0,
    conversions: 0,
    conversionRate: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    topCustomers: [] as any[],
    dailySales: [] as any[],
  })

  useEffect(() => {
    checkAndLoad()
  }, [timeframe])

  const checkAndLoad = async () => {
    const access = canAccessSeller()
    if (!access.canAccess) {
      router.back()
      return
    }
    loadAnalytics()
  }

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // Fetch analytics data based on timeframe
      const response = await api.getSellerAnalytics({ timeframe })
      
      if (response) {
         setAnalyticsData({
           views: response.views || 0,
           clicks: response.clicks || 0,
           conversions: response.conversions || 0,
           conversionRate: response.conversions && response.clicks ? parseFloat((response.conversions / response.clicks * 100).toFixed(2)) : 0,
           avgOrderValue: response.avgOrderValue || 0,
           topProducts: response.topProducts || [],
           topCustomers: response.topCustomers || [],
           dailySales: response.dailySales || [],
         })
      }
    } catch (error) {
      console.error('[v0] Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const timeframeButtons = [
    { label: 'Week', value: 'week' as const },
    { label: 'Month', value: 'month' as const },
    { label: 'Year', value: 'year' as const },
  ]

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeContainer}>
          {timeframeButtons.map((btn) => (
            <TouchableOpacity
              key={btn.value}
              style={[styles.timeframeBtn, timeframe === btn.value && styles.timeframeBtnActive]}
              onPress={() => setTimeframe(btn.value)}
            >
              <Text style={[styles.timeframeBtnText, timeframe === btn.value && styles.timeframeBtnTextActive]}>
                {btn.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Product Views</Text>
              <Feather name="eye" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>{analyticsData.views.toLocaleString()}</Text>
            <Text style={styles.metricChange}>+12% from last {timeframe}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Click Through</Text>
              <Feather name="mouse-pointer" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.metricValue}>{analyticsData.clicks.toLocaleString()}</Text>
            <Text style={styles.metricChange}>+8% from last {timeframe}</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Conversions</Text>
              <Feather name="check-circle" size={18} color={Colors.success} />
            </View>
            <Text style={styles.metricValue}>{analyticsData.conversions}</Text>
            <Text style={styles.metricChange}>{analyticsData.conversionRate}% conversion rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={styles.metricTop}>
              <Text style={styles.metricLabel}>Avg Order Value</Text>
              <Feather name="trending-up" size={18} color={Colors.warning} />
            </View>
            <Text style={styles.metricValue}>KES {analyticsData.avgOrderValue.toFixed(0)}</Text>
            <Text style={styles.metricChange}>Order average</Text>
          </View>
        </View>

        {/* Top Products */}
        {analyticsData.topProducts.length > 0 && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            {analyticsData.topProducts.slice(0, 5).map((product, idx) => (
              <View key={idx} style={styles.topItem}>
                <View style={styles.topItemRank}>
                  <Text style={styles.topItemRankText}>{idx + 1}</Text>
                </View>
                <View style={styles.topItemInfo}>
                  <Text style={styles.topItemName}>{product.name || 'Product'}</Text>
                  <Text style={styles.topItemSales}>{product.sales || 0} sales</Text>
                </View>
                <Text style={styles.topItemValue}>KES {product.revenue || 0}</Text>
              </View>
            ))}
          </View>
        )}

         {/* Performance Tips */}
         <View style={styles.tipsCard}>
           <View style={styles.tipsHeader}>
             <Feather name="info" size={18} color={Colors.gold} />
             <Text style={styles.tipsTitle}>Performance Tips</Text>
           </View>
          <Text style={styles.tipText}>• Add more product images to increase click-through rate</Text>
          <Text style={styles.tipText}>• Improve product descriptions to boost conversions</Text>
          <Text style={styles.tipText}>• Offer competitive pricing to increase sales volume</Text>
          <Text style={styles.tipText}>• Respond quickly to customer inquiries</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  timeframeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  timeframeBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeframeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  timeframeBtnTextActive: {
    color: Colors.text.white,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  topItemRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topItemRankText: {
    fontWeight: '700',
    color: Colors.primary,
  },
  topItemInfo: {
    flex: 1,
  },
  topItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  topItemSales: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  topItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: Colors.gold + '15',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.gold,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gold,
  },
  tipText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 6,
    lineHeight: 18,
  },
})
