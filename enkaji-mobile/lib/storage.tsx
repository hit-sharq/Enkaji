import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_KEYS = {
  PRODUCTS: '@enkaji/products',
  PRODUCT_DETAIL: '@enkaji/product/',
  CATEGORIES: '@enkaji/categories',
  CART: '@enkaji/cart',
  USER: '@enkaji/user',
  SEARCH_HISTORY: '@enkaji/search/history',
} as const

const CACHE_TTL = {
  PRODUCTS: 1000 * 60 * 15, // 15 minutes
  CATEGORIES: 1000 * 60 * 60, // 1 hour
  CART: 0, // Never expires (local only)
  USER: 1000 * 60 * 30, // 30 minutes
}

interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

class StorageService {
  /**
   * Set a value with optional TTL (in ms)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const item: CacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      expiry: ttl ? Date.now() + ttl : 0,
    }
    await AsyncStorage.setItem(key, JSON.stringify(item))
  }

  /**
   * Get a value, checking for expiry
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key)
      if (!raw) return null

      const item: CacheItem<T> = JSON.parse(raw)

      // Check expiry
      if (item.expiry > 0 && Date.now() > item.expiry) {
        await AsyncStorage.removeItem(key)
        return null
      }

      return item.data
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  /**
   * Remove a value
   */
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key)
  }

  /**
   * Clear all storage (for logout)
   */
  async clear(): Promise<void> {
    await AsyncStorage.clear()
  }

  // ==================== PRODUCTS ====================

  async cacheProducts(products: any, ttl = CACHE_TTL.PRODUCTS): Promise<void> {
    await this.set(CACHE_KEYS.PRODUCTS, products, ttl)
  }

  async getCachedProducts(): Promise<any | null> {
    return await this.get(CACHE_KEYS.PRODUCTS)
  }

  async cacheProductDetail(productId: string, product: any): Promise<void> {
    const key = `${CACHE_KEYS.PRODUCT_DETAIL}${productId}`
    await this.set(key, product, CACHE_TTL.PRODUCTS)
  }

  async getCachedProductDetail(productId: string): Promise<any | null> {
    const key = `${CACHE_KEYS.PRODUCT_DETAIL}${productId}`
    return await this.get(key)
  }

  // ==================== CATEGORIES ====================

  async cacheCategories(categories: any[]): Promise<void> {
    await this.set(CACHE_KEYS.CATEGORIES, categories, CACHE_TTL.CATEGORIES)
  }

  async getCachedCategories(): Promise<any[] | null> {
    return await this.get(CACHE_KEYS.CATEGORIES)
  }

  // ==================== CART (persistent local) ====================

  async saveCart(cart: any): Promise<void> {
    await this.set(CACHE_KEYS.CART, cart, 0) // Never expire
  }

  async getCart(): Promise<any | null> {
    return await this.get(CACHE_KEYS.CART)
  }

  async clearCart(): Promise<void> {
    await this.remove(CACHE_KEYS.CART)
  }

  // ==================== USER ====================

  async saveUser(user: any): Promise<void> {
    await this.set(CACHE_KEYS.USER, user, CACHE_TTL.USER)
  }

  async getUser(): Promise<any | null> {
    return await this.get(CACHE_KEYS.USER)
  }

  async clearUser(): Promise<void> {
    await this.remove(CACHE_KEYS.USER)
  }

  // ==================== SEARCH HISTORY ====================

  async addSearchQuery(query: string): Promise<void> {
    const history = await this.getSearchHistory() || []
    // Remove duplicate if exists
    const filtered = history.filter((q: string) => q !== query)
    // Add to front, limit to 10
    const newHistory = [query, ...filtered].slice(0, 10)
    await this.set(CACHE_KEYS.SEARCH_HISTORY, newHistory, 0)
  }

  async getSearchHistory(): Promise<string[] | null> {
    return await this.get<string[]>(CACHE_KEYS.SEARCH_HISTORY)
  }

  async clearSearchHistory(): Promise<void> {
    await this.remove(CACHE_KEYS.SEARCH_HISTORY)
  }
}

export const storageService = new StorageService()
