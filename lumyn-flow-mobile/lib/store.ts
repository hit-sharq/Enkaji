import { create } from 'zustand'

interface AuthState {
  role: 'customer' | 'driver' | null
  userId: string | null
  user: any | null
  isAuthenticated: boolean
  setRole: (role: 'customer' | 'driver') => void
  setUser: (user: any) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  userId: null,
  user: null,
  isAuthenticated: false,
  setRole: (role) => set({ role }),
  setUser: (user) => set({ user, userId: user?.id, isAuthenticated: !!user }),
  logout: () => set({ role: null, userId: null, user: null, isAuthenticated: false }),
}))

interface Delivery {
  id: string
  deliveryNumber: string
  status: string
  pickupAddress: string
  dropoffAddress: string
  totalAmount: number
  distanceKm: number
  createdAt: string
  driver?: any
  customer?: any
}

interface DeliveryState {
  deliveries: Delivery[]
  currentDelivery: Delivery | null
  setDeliveries: (deliveries: Delivery[]) => void
  setCurrentDelivery: (delivery: Delivery | null) => void
  addDelivery: (delivery: Delivery) => void
  updateDelivery: (id: string, updates: Partial<Delivery>) => void
}

export const useDeliveryStore = create<DeliveryState>((set) => ({
  deliveries: [],
  currentDelivery: null,
  setDeliveries: (deliveries) => set({ deliveries }),
  setCurrentDelivery: (currentDelivery) => set({ currentDelivery }),
  addDelivery: (delivery) =>
    set((state) => ({ deliveries: [delivery, ...state.deliveries] })),
  updateDelivery: (id, updates) =>
    set((state) => ({
      deliveries: state.deliveries.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
      currentDelivery:
        state.currentDelivery?.id === id
          ? { ...state.currentDelivery, ...updates }
          : state.currentDelivery,
    })),
}))

interface DriverState {
  driver: any | null
  availableJobs: any[]
  earnings: any[]
  setDriver: (driver: any) => void
  setAvailableJobs: (jobs: any[]) => void
  setEarnings: (earnings: any[]) => void
}

export const useDriverStore = create<DriverState>((set) => ({
  driver: null,
  availableJobs: [],
  earnings: [],
  setDriver: (driver) => set({ driver }),
  setAvailableJobs: (availableJobs) => set({ availableJobs }),
  setEarnings: (earnings) => set({ earnings }),
}))
