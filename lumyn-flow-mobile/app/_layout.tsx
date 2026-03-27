import { useEffect } from 'react'
import { Slot } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key)
    } catch (err) {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (err) {
      return
    }
  },
}

export default function RootLayout() {
  const { isSignedIn, getToken } = useAuth()
  const { setUser } = useAuthStore()

  useEffect(() => {
    if (isSignedIn) {
      const syncToken = async () => {
        try {
          const token = await getToken()
          if (token) {
            api.setToken(token)
          }
        } catch (error) {
          console.error('Token sync error:', error)
        }
      }
      syncToken()
    } else {
      api.setToken(null)
      setUser(null)
    }
  }, [isSignedIn])

  return <Slot />
}
