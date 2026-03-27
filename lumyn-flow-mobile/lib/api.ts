import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.EXPO_PUBLIC_LUMYN_API_URL || 'http://localhost:5000'

class LumynApiClient {
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

    this.client.interceptors.request.use(
      async (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  setToken(token: string | null) {
    this.token = token
  }

  async createDelivery(data: any) {
    const response = await this.client.post('/api/lumyn/deliveries', data)
    return response.data
  }

  async getDeliveries(role: 'customer' | 'driver', status?: string) {
    const params = { role }
    if (status) Object.assign(params, { status })
    const response = await this.client.get('/api/lumyn/deliveries', { params })
    return response.data
  }

  async getDelivery(id: string) {
    const response = await this.client.get(`/api/lumyn/deliveries/${id}`)
    return response.data
  }

  async acceptDelivery(id: string) {
    const response = await this.client.post(`/api/lumyn/deliveries/${id}`, {
      action: 'accept',
    })
    return response.data
  }

  async rateDelivery(id: string, rating: number, comment?: string) {
    const response = await this.client.post(`/api/lumyn/deliveries/${id}/rate`, {
      rating,
      comment,
    })
    return response.data
  }

  async registerDriver(data: any) {
    const response = await this.client.post('/api/lumyn/drivers', data)
    return response.data
  }

  async getAvailableJobs() {
    const response = await this.client.get('/api/lumyn/drivers')
    return response.data
  }

  async getDriver(id: string, includeEarnings?: boolean) {
    const params = includeEarnings ? { earnings: 'true' } : {}
    const response = await this.client.get(`/api/lumyn/drivers/${id}`, { params })
    return response.data
  }

  async updateDriver(id: string, data: any) {
    const response = await this.client.put(`/api/lumyn/drivers/${id}`, data)
    return response.data
  }
}

export default new LumynApiClient()
