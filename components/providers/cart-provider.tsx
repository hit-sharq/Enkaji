"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  total: number
  loading: boolean
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }
  | { type: "SET_LOADING"; payload: boolean }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.id === action.payload.id)

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
        )
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        }
      }

      const newItems = [...state.items, action.payload]
      return {
        ...state,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        ...state,
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) => (item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item))
        .filter((item) => item.quantity > 0)

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }

    case "CLEAR_CART":
      return { ...state, items: [], total: 0 }

    case "LOAD_CART": {
      return {
        ...state,
        items: action.payload,
        total: action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0),
      }
    }

    case "SET_LOADING":
      return { ...state, loading: action.payload }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, loading: true })

  useEffect(() => {
    const loadCartFromDatabase = async () => {
      try {
        dispatch({ type: "SET_LOADING", payload: true })
        const response = await fetch("/api/cart")

        if (response.ok) {
          const data = await response.json()
          // Transform database cart items to match CartItem interface
          const cartItems =
            data.items?.map((item: any) => ({
              id: item.productId,
              name: item.product?.name || "Unknown Product",
              price: item.product?.price || 0,
              quantity: item.quantity,
              image: item.product?.images?.[0] || null,
            })) || []

          dispatch({ type: "LOAD_CART", payload: cartItems })
        } else {
          // Fallback to localStorage if API fails
          const savedCart = localStorage.getItem("cart")
          if (savedCart) {
            try {
              const parsedCart = JSON.parse(savedCart)
              dispatch({ type: "LOAD_CART", payload: parsedCart })
            } catch (error) {
              console.error("Error loading cart from localStorage:", error)
            }
          }
        }
      } catch (error) {
        console.error("Error loading cart from database:", error)
        // Fallback to localStorage
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          try {
            const parsedCart = JSON.parse(savedCart)
            dispatch({ type: "LOAD_CART", payload: parsedCart })
          } catch (error) {
            console.error("Error loading cart from localStorage:", error)
          }
        }
      } finally {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    loadCartFromDatabase()
  }, [])

  // Save cart to localStorage whenever it changes (as backup)
  useEffect(() => {
    if (!state.loading) {
      localStorage.setItem("cart", JSON.stringify(state.items))
    }
  }, [state.items, state.loading])

  return <CartContext.Provider value={{ state, dispatch }}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
