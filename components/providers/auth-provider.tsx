'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthTokens, User, login, logout, getTokens, getUser, isAuthenticated } from '@/lib/auth-client'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isAuthenticated: boolean
  login: (tokens: AuthTokens, user: User) => void
  logout: () => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load auth state from localStorage on mount
    const loadAuthState = () => {
      try {
        const storedTokens = getTokens()
        const storedUser = getUser()

        if (storedTokens && storedUser && isAuthenticated()) {
          setTokens(storedTokens)
          setUser(storedUser)
        } else {
          // Clear invalid state
          logout()
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    loadAuthState()
  }, [])

  const handleLogin = (newTokens: AuthTokens, newUser: User) => {
    login(newTokens, newUser)
    setTokens(newTokens)
    setUser(newUser)
  }

  const handleLogout = () => {
    logout()
    setTokens(null)
    setUser(null)
  }

  const refreshAuth = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        handleLogin(data.tokens, data.user)
      } else {
        handleLogout()
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      handleLogout()
    }
  }

  const value: AuthContextType = {
    user,
    tokens,
    isAuthenticated: !!user && !!tokens && isAuthenticated(),
    login: handleLogin,
    logout: handleLogout,
    refreshAuth,
  }

  if (isLoading) {
    return <div>Loading...</div> // You can replace this with a proper loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
