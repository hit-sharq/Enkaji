import { useEffect, useState, useCallback } from 'react'
import { storageService } from '@/lib/storage'
import api from '@/lib/api'
import { useDataSync } from './use-data-sync'

export function useCachedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { invalidateCache } = useDataSync()

  const fetchProducts = useCallback(async (forceRefresh = false) => {
    setLoading(true)
    try {
      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = await storageService.getCachedProducts()
        if (cached) {
          setProducts(cached)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      const response = await api.getProducts()
      const productList = Array.isArray(response) ? response : response.products || []
      setProducts(productList)

      // Cache for 15 minutes
      await storageService.cacheProducts(productList)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // If network fails, try to load stale cache
      const cached = await storageService.getCachedProducts()
      if (cached) {
        setProducts(cached)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    await invalidateCache('@enkaji/products')
    await fetchProducts(true)
    setRefreshing(false)
  }, [invalidateCache, fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return { products, loading, refreshing, refresh, refetch: fetchProducts }
}

export function useCachedProductDetail(productId: string) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        // Try cache first
        const cached = await storageService.getCachedProductDetail(productId)
        if (cached) {
          setProduct(cached)
          setLoading(false)
          return
        }

        // Fetch from API
        const response = await api.getProduct(productId)
        setProduct(response)
        await storageService.cacheProductDetail(productId, response)
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const refresh = async () => {
    await storageService.remove(`@enkaji/product/detail/${productId}`)
    setLoading(true)
    const response = await api.getProduct(productId)
    setProduct(response)
    await storageService.cacheProductDetail(productId, response)
    setLoading(false)
  }

  return { product, loading, refresh }
}

export function useCachedCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const cached = await storageService.getCachedCategories()
        if (cached) {
          setCategories(cached)
          setLoading(false)
          return
        }

        const response = await api.getCategories()
        setCategories(response)
        await storageService.cacheCategories(response)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const refresh = async () => {
    await storageService.remove('@enkaji/categories')
    setLoading(true)
    const response = await api.getCategories()
    setCategories(response)
    await storageService.cacheCategories(response)
    setLoading(false)
  }

  return { categories, loading, refresh }
}
