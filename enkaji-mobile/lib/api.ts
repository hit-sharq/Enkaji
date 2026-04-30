// API Client for Enkaji Mobile App
// This connects to the existing Next.js API endpoints

import axios, { AxiosInstance, AxiosError } from 'axios'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'

class ApiClient {
  private client: AxiosInstance
  private token: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.token = null
          // Handle redirect to login
        }
        return Promise.reject(error)
      }
    )
  }

  setToken(token: string | null) {
    this.token = token
  }

   // Products
   async getProducts(params?: {
     category?: string
     search?: string
     minPrice?: number
     maxPrice?: number
     sortBy?: string
     page?: number
     limit?: number
     location?: string
   }) {
    const response = await this.client.get('/api/products', { params })
    return response.data
  }

  async getProduct(id: string) {
    const response = await this.client.get(`/api/products/${id}`)
    return response.data
  }

  async getFeaturedProducts() {
    const response = await this.client.get('/api/products?featured=true')
    return response.data
  }

  // Categories
  async getCategories() {
    const response = await this.client.get('/api/categories')
    return response.data
  }

  async getCategory(slug: string) {
    const response = await this.client.get(`/api/categories/${slug}`)
    return response.data
  }

  // Cart
  async getCart() {
    const response = await this.client.get('/api/cart')
    return response.data
  }

  async addToCart(productId: string, quantity: number = 1) {
    const response = await this.client.post('/api/cart', { productId, quantity })
    return response.data
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await this.client.put(`/api/cart/${itemId}`, { quantity })
    return response.data
  }

  async removeCartItem(itemId: string) {
    const response = await this.client.delete(`/api/cart/${itemId}`)
    return response.data
  }

  async clearCart() {
    const response = await this.client.delete('/api/cart')
    return response.data
  }

  // Orders
  async getOrders() {
    const response = await this.client.get('/api/orders')
    return response.data
  }

  async getOrder(id: string) {
    const response = await this.client.get(`/api/orders/${id}`)
    return response.data
  }

  async createOrder(data: {
    items: Array<{ productId: string; quantity: number; price: number }>
    shippingAddress: any
    billingAddress?: any
    paymentMethod: string
    subtotal: number
    tax: number
    shipping: number
    total: number
  }) {
    const response = await this.client.post('/api/orders', data)
    return response.data
  }

  // NEW: Initiate checkout payment (creates checkout session, returns Pesapal redirect)
  async initiateCheckoutPayment(data: {
    items: Array<{ productId: string; quantity: number; price: number }>
    shippingAddress: any
    selectedShippingOption?: string | null
    paymentMethod: string
  }) {
    const response = await this.client.post('/api/checkout/initiate-payment', data)
    return response.data
  }

  // LEGACY: Direct Pesapal payment for existing orders
  async initiatePesapalPayment(orderId: string) {
    const response = await this.client.post('/api/pesapal/submit-order', {
      orderId,
      currency: 'KES',
    })
    return response.data
  }

  // Get payment status
  async getPaymentStatus(merchantReference: string) {
    const response = await this.client.get(`/api/pesapal/order-status?reference=${merchantReference}`)
    return response.data
  }

  // Shipping
  async calculateShipping(data: {
    items: Array<{ id: string; weight: number; value: number }>
    destination: { country: string; city: string; state?: string }
    cod?: boolean
  }) {
    const response = await this.client.post('/api/shipping/calculate', data)
    return response.data
  }

  // Favorites
  async getFavorites() {
    const response = await this.client.get('/api/favorites')
    return response.data
  }

  async addFavorite(productId: string) {
    const response = await this.client.post('/api/favorites', { productId })
    return response.data
  }

  async removeFavorite(productId: string) {
    const response = await this.client.delete(`/api/favorites?productId=${productId}`)
    return response.data
  }

  // Reviews
  async getProductReviews(productId: string) {
    const response = await this.client.get(`/api/reviews?productId=${productId}`)
    return response.data
  }

  async createReview(data: {
    productId: string
    rating: number
    title?: string
    comment?: string
  }) {
    const response = await this.client.post('/api/reviews', data)
    return response.data
  }

  async markReviewHelpful(reviewId: string) {
    const response = await this.client.post(`/api/reviews/${reviewId}/helpful`)
    return response.data
  }

  // User profile (with real role from database)
  async getUserProfile() {
    const response = await this.client.get('/api/user/me')
    return response.data
  }

  // Auth
  async checkAuth() {
    await this.client.get('/api/auth/check-access')
    return true
  }

  async checkAdmin() {
    const response = await this.client.get('/api/auth/check-admin')
    return response.data
  }

  // Seller
  async getSellerDashboard() {
    const response = await this.client.get('/api/seller/dashboard')
    return response.data
  }

  async registerSeller(data: {
    businessName: string
    businessType: string
    location: string
    phoneNumber: string
    description?: string
    website?: string
    plan?: string
  }) {
    const response = await this.client.post('/api/seller/register', data)
    return response.data
  }

  async getAdminStats() {
    const response = await this.client.get('/api/admin/stats')
    return response.data
  }

  async getSellerProducts() {
    const response = await this.client.get('/api/products?seller=true')
    return response.data
  }

  async createProduct(data: any) {
    const response = await this.client.post('/api/products', data)
    return response.data
  }

  async updateProduct(id: string, data: any) {
    const response = await this.client.put(`/api/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string) {
    const response = await this.client.delete(`/api/products/${id}`)
    return response.data
  }

   async getSellerPayouts() {
     const response = await this.client.get('/api/seller/payouts')
     return response.data
   }

   async getSellerAnalytics(params?: { timeframe?: 'week' | 'month' | 'year' }) {
     const response = await this.client.get('/api/seller/analytics', { params })
     return response.data
   }

  async requestPayout(data: { amount: number; method: string }) {
    const response = await this.client.post('/api/seller/payouts/request', data)
    return response.data
  }

  // Blog
  async getBlogPosts() {
    const response = await this.client.get('/api/blog')
    return response.data
  }

  async getBlogPost(slug: string) {
    const response = await this.client.get(`/api/blog/${slug}`)
    return response.data
  }

  // RFQ
  async getRFQs() {
    const response = await this.client.get('/api/rfq')
    return response.data
  }

  async createRFQ(data: {
    title: string
    description: string
    category: string
    quantity: number
    budget?: number
    deadline?: string
    location?: string
  }) {
    const response = await this.client.post('/api/rfq', data)
    return response.data
  }

  // Bulk Orders
  async getBulkOrders() {
    const response = await this.client.get('/api/bulk-orders')
    return response.data
  }

  async createBulkOrder(data: {
    title: string
    description?: string
    items: Array<{ productId: string; quantity: number }>
  }) {
    const response = await this.client.post('/api/bulk-orders', data)
    return response.data
  }

  // Contact/Newsletter
  async subscribeNewsletter(email: string) {
    const response = await this.client.post('/api/newsletter', { email })
    return response.data
  }

  async submitContact(data: {
    email: string
    firstName?: string
    lastName?: string
    subject?: string
    message?: string
  }) {
    const response = await this.client.post('/api/contact', data)
    return response.data
  }

  // ==================== SERVICES & BOOKINGS ====================
  // Service Categories
  async getServiceCategories() {
    const response = await this.client.get('/api/categories')
    return response.data
  }

  // Subscription (Seller)
  async getSubscription() {
    const response = await this.client.get('/api/seller/subscription')
    return response.data
  }

  async updateSubscription(data: { planType: string; phoneNumber?: string }) {
    const response = await this.client.post('/api/seller/subscription', data)
    return response.data
  }

  // Services
  async getServices(params?: {
    category?: string
    location?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const response = await this.client.get('/api/services', { params })
    return response.data
  }

  async getService(id: string) {
    const response = await this.client.get(`/api/services/${id}`)
    return response.data
  }

  async getFeaturedServices() {
    const response = await this.client.get('/api/services?featured=true')
    return response.data
  }

  // Service Providers
  async getProvider(slug: string) {
    const response = await this.client.get(`/api/services/providers/${slug}`)
    return response.data
  }

  async getProviderServices(slug: string) {
    const response = await this.client.get(`/api/services/providers/${slug}/services`)
    return response.data
  }

  async updateProviderProfile(data: any) {
    const response = await this.client.put('/api/services/providers/profile', data)
    return response.data
  }

  // Working Hours
  async getWorkingHours() {
    const response = await this.client.get('/api/services/working-hours')
    return response.data
  }

  async updateWorkingHours(workingHours: Array<{
    dayOfWeek: number
    openTime: string
    closeTime: string
    isOpen: boolean
  }>) {
    const response = await this.client.post('/api/services/working-hours', { workingHours })
    return response.data
  }

  // Bookings (Customer)
  async getMyBookings() {
    const response = await this.client.get('/api/services/bookings/me')
    return response.data
  }

  async getBooking(id: string) {
    const response = await this.client.get(`/api/services/bookings/${id}`)
    return response.data
  }

  async createBooking(data: {
    serviceId: string
    date: string
    timeSlot: string
    customerName: string
    customerPhone: string
    customerEmail?: string
    notes?: string
  }) {
    const response = await this.client.post('/api/services/bookings', data)
    return response.data
  }

  async cancelBooking(bookingId: string, reason?: string) {
    const response = await this.client.patch('/api/services/bookings', {
      bookingId,
      action: 'cancel',
      reason,
    })
    return response.data
  }

  // Bookings (Provider)
  async getProviderBookings(params?: { status?: string; date?: string }) {
    const response = await this.client.get('/api/services/bookings', { params })
    return response.data
  }

  async updateBookingStatus(bookingId: string, action: 'confirm' | 'complete' | 'cancel', reason?: string) {
    const response = await this.client.patch('/api/services/bookings', {
      bookingId,
      action,
      reason,
    })
    return response.data
  }

  // Service Reviews
  async getServiceReviews(serviceId: string, page?: number) {
    const response = await this.client.get(`/api/services/reviews?serviceId=${serviceId}${page ? `&page=${page}` : ''}`)
    return response.data
  }

  async createServiceReview(data: {
    serviceId: string
    rating: number
    title?: string
    comment?: string
    images?: string[]
    bookingId?: string
  }) {
    const response = await this.client.post('/api/services/reviews', data)
    return response.data
  }

  // Service CRUD (Provider)
  async createService(data: any) {
    const response = await this.client.post('/api/services', data)
    return response.data
  }

  async updateService(id: string, data: any) {
    const response = await this.client.put(`/api/services/${id}`, data)
    return response.data
  }

  async deleteService(id: string) {
    const response = await this.client.delete(`/api/services/${id}`)
    return response.data
  }

   async getMyServices() {
     const response = await this.client.get('/api/services?my=true')
     return response.data
   }

   // Notifications
   async registerNotificationToken(token: string, platform: string) {
     const response = await this.client.post('/api/notifications/token', { token, platform })
     return response.data
   }

   async getUnreadNotificationCount() {
     const response = await this.client.get('/api/notifications/unread-count')
     return response.data
   }

   // App Version Management
  async checkAppVersion() {
    try {
      const response = await this.client.get('/api/app-version')
      return response.data
    } catch (error) {
      console.log('[v0] Version check failed (optional):', error)
      return { latestVersion: null, forceUpdate: false }
    }
  }

  async getAppUpdateNotes() {
    try {
      const response = await this.client.get('/api/app-update-notes')
      return response.data
    } catch (error) {
      return { notes: [] }
    }
  }

  async reportUpdateEvent(event: 'update_checked' | 'update_downloaded' | 'update_installed', data?: any) {
    try {
      await this.client.post('/api/app-update-events', {
        event,
        timestamp: new Date().toISOString(),
        ...data,
      })
    } catch (error) {
      console.log('[v0] Failed to report update event:', error)
    }
  }
}

export const api = new ApiClient()
export default api
