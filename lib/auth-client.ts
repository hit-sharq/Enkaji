// Client-side authentication utilities using localStorage

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

const TOKENS_KEY = 'enkaji_auth_tokens'
const USER_KEY = 'enkaji_user'
const GUEST_MODE_KEY = 'enkaji_guest_mode'

export function setTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } catch (error) {
    console.error('Error setting tokens to localStorage:', error)
  }
}

export function getTokens(): AuthTokens | null {
  try {
    const tokens = localStorage.getItem(TOKENS_KEY)
    return tokens ? JSON.parse(tokens) : null
  } catch (error) {
    console.error('Error getting tokens from localStorage:', error)
    return null
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKENS_KEY)
  } catch (error) {
    console.error('Error clearing tokens from localStorage:', error)
  }
}

export function setUser(user: User): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error setting user to localStorage:', error)
  }
}

export function getUser(): User | null {
  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user from localStorage:', error)
    return null
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error clearing user from localStorage:', error)
  }
}

export function setGuestMode(enabled: boolean): void {
  try {
    localStorage.setItem(GUEST_MODE_KEY, JSON.stringify(enabled))
  } catch (error) {
    console.error('Error setting guest mode to localStorage:', error)
  }
}

export function getGuestMode(): boolean {
  try {
    const guestMode = localStorage.getItem(GUEST_MODE_KEY)
    return guestMode ? JSON.parse(guestMode) : false
  } catch (error) {
    console.error('Error getting guest mode from localStorage:', error)
    return false
  }
}

export function clearGuestMode(): void {
  try {
    localStorage.removeItem(GUEST_MODE_KEY)
  } catch (error) {
    console.error('Error clearing guest mode from localStorage:', error)
  }
}

export function isAuthenticated(): boolean {
  const tokens = getTokens()
  if (!tokens) return false

  // Check if tokens are expired
  const now = Date.now()
  return tokens.expiresAt > now
}

export function logout(): void {
  clearTokens()
  clearUser()
  clearGuestMode()
}

export function login(tokens: AuthTokens, user: User): void {
  setTokens(tokens)
  setUser(user)
  setGuestMode(false)
}
