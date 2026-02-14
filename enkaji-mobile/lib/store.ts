// Zustand Store for Enkaji Mobile App
import { create } from 'zustand'
import { 
  CartItem, 
  Product, 
  Order, 
  Category, 
  Favorite,
  AuthUser 
} from '@/types'

// Auth Store
interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false }),
}))

// Cart Store
interface CartState {
  items: CartItem[]
  isLoading: boolean
  totalItems: number
  totalPrice: number
  setItems: (items: CartItem[]) => void
  setLoading: (loading: boolean) => void
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  totalItems: 0,
  totalPrice: 0,
  setItems: (items) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalPrice = items.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0)
    set({ items, totalItems, totalPrice })
  },
  setLoading: (isLoading) => set({ isLoading }),
  addItem: (item) => {
    const items = [...get().items]
    const existingIndex = items.findIndex(i => i.productId === item.productId)
    
    if (existingIndex >= 0) {
      items[existingIndex].quantity += item.quantity
    } else {
      items.push(item)
    }
    
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0)
    set({ items, totalItems, totalPrice })
  },
  removeItem: (itemId) => {
    const items = get().items.filter(i => i.id !== itemId)
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0)
    set({ items, totalItems, totalPrice })
  },
  updateQuantity: (itemId, quantity) => {
    const items = get().items.map(i => 
      i.id === itemId ? { ...i, quantity } : i
    )
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
    const totalPrice = items.reduce((sum, i) => sum + ((i.product?.price || 0) * i.quantity), 0)
    set({ items, totalItems, totalPrice })
  },
  clearCart: () => set({ items: [], totalItems: 0, totalPrice: 0 }),
}))

// Products Store
interface ProductsState {
  products: Product[]
  featuredProducts: Product[]
  categories: Category[]
  currentProduct: Product | null
  isLoading: boolean
  setProducts: (products: Product[]) => void
  setFeaturedProducts: (products: Product[]) => void
  setCategories: (categories: Category[]) => void
  setCurrentProduct: (product: Product | null) => void
  setLoading: (loading: boolean) => void
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  currentProduct: null,
  isLoading: false,
  setProducts: (products) => set({ products }),
  setFeaturedProducts: (featuredProducts) => set({ featuredProducts }),
  setCategories: (categories) => set({ categories }),
  setCurrentProduct: (currentProduct) => set({ currentProduct }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// Orders Store
interface OrdersState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  setOrders: (orders: Order[]) => void
  setCurrentOrder: (order: Order | null) => void
  setLoading: (loading: boolean) => void
  addOrder: (order: Order) => void
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (currentOrder) => set({ currentOrder }),
  setLoading: (isLoading) => set({ isLoading }),
  addOrder: (order) => set({ orders: [order, ...get().orders] }),
}))

// Favorites Store
interface FavoritesState {
  favorites: Favorite[]
  isLoading: boolean
  setFavorites: (favorites: Favorite[]) => void
  addFavorite: (favorite: Favorite) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: false,
  setFavorites: (favorites) => set({ favorites }),
  addFavorite: (favorite) => set({ favorites: [...get().favorites, favorite] }),
  removeFavorite: (productId) => set({ 
    favorites: get().favorites.filter(f => f.productId !== productId) 
  }),
  isFavorite: (productId) => get().favorites.some(f => f.productId === productId),
}))

// UI Store
interface UIState {
  isSearchVisible: boolean
  searchQuery: string
  selectedCategory: string | null
  setSearchVisible: (visible: boolean) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  isSearchVisible: false,
  searchQuery: '',
  selectedCategory: null,
  setSearchVisible: (isSearchVisible) => set({ isSearchVisible }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}))
