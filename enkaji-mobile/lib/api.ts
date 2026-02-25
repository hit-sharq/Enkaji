// API Client for Enkaji Mobile App
// This connects to the existing Next.js API endpoints

import axios, { AxiosInstance, AxiosError } from 'axios'
import * as SecureStore from 'expo-secure-store'

// Base URL - update this for production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.origin.includes('replit.app') ? window.location.origin : 'http://localhost:5000')

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
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    paymentMethod: string
  }) {
    const response = await this.client.post('/api/orders', data)
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

  // Auth
  async checkAuth() {
    const response = await this.client.get('/api/auth/check-access')
    return response.data
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
}

export const api = new ApiClient()
export default api

