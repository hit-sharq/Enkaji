import { encrypt, decrypt } from './encryption'

// Secure storage for sensitive data
class SecureStorage {
  private static instance: SecureStorage
  private secrets: Map<string, string> = new Map()

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage()
    }
    return SecureStorage.instance
  }

  // Store encrypted secret
  setSecret(key: string, value: string): void {
    const encrypted = encrypt(value)
    this.secrets.set(key, encrypted)
  }

  // Retrieve decrypted secret
  getSecret(key: string): string | null {
    const encrypted = this.secrets.get(key)
    if (!encrypted) return null

    try {
      return decrypt(encrypted)
    } catch (error) {
      console.error(`Failed to decrypt secret for key: ${key}`, error)
      return null
    }
  }

  // Check if secret exists
  hasSecret(key: string): boolean {
    return this.secrets.has(key)
  }

  // Remove secret
  removeSecret(key: string): boolean {
    return this.secrets.delete(key)
  }

  // Clear all secrets
  clear(): void {
    this.secrets.clear()
  }

  // Get all secret keys (for debugging)
  getKeys(): string[] {
    return Array.from(this.secrets.keys())
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance()

// Utility functions for common secrets
export class SecretsManager {
  private static readonly PREFIX = 'enkaji_secret_'

  // Store payment credentials securely
  static setPaymentCredentials(provider: string, credentials: Record<string, string>): void {
    const key = `${this.PREFIX}payment_${provider}`
    secureStorage.setSecret(key, JSON.stringify(credentials))
  }

  // Get payment credentials securely
  static getPaymentCredentials(provider: string): Record<string, string> | null {
    const key = `${this.PREFIX}payment_${provider}`
    const encrypted = secureStorage.getSecret(key)
    if (!encrypted) return null

    try {
      return JSON.parse(encrypted)
    } catch {
      return null
    }
  }

  // Store bank details securely
  static setBankDetails(userId: string, bankDetails: Record<string, any>): void {
    const key = `${this.PREFIX}bank_${userId}`
    secureStorage.setSecret(key, JSON.stringify(bankDetails))
  }

  // Get bank details securely
  static getBankDetails(userId: string): Record<string, any> | null {
    const key = `${this.PREFIX}bank_${userId}`
    const encrypted = secureStorage.getSecret(key)
    if (!encrypted) return null

    try {
      return JSON.parse(encrypted)
    } catch {
      return null
    }
  }

  // Store API keys securely
  static setApiKey(service: string, apiKey: string): void {
    const key = `${this.PREFIX}api_${service}`
    secureStorage.setSecret(key, apiKey)
  }

  // Get API key securely
  static getApiKey(service: string): string | null {
    const key = `${this.PREFIX}api_${service}`
    return secureStorage.getSecret(key)
  }

  // Store user tokens securely
  static setUserToken(userId: string, token: string): void {
    const key = `${this.PREFIX}token_${userId}`
    secureStorage.setSecret(key, token)
  }

  // Get user token securely
  static getUserToken(userId: string): string | null {
    const key = `${this.PREFIX}token_${userId}`
    return secureStorage.getSecret(key)
  }

  // Clear all secrets for a user
  static clearUserSecrets(userId: string): void {
    const keysToRemove = secureStorage.getKeys().filter(key =>
      key.includes(`${this.PREFIX}bank_${userId}`) ||
      key.includes(`${this.PREFIX}token_${userId}`)
    )

    keysToRemove.forEach(key => secureStorage.removeSecret(key))
  }

  // Rotate encryption key (for key rotation)
  static rotateEncryptionKey(newKey: string): void {
    // This would require re-encrypting all stored secrets with the new key
    // Implementation depends on your key management strategy
    console.warn('Key rotation not implemented. All secrets should be re-encrypted with new key.')
  }
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Secure password generation
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  let password = ''
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  const allChars = uppercase + lowercase + numbers + symbols
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
