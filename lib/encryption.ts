import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const IV_LENGTH = 16

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required')
}

// Type assertion since we've checked it exists
const encryptionKey: string = ENCRYPTION_KEY

export function encrypt(text: string): string {
  const iv = CryptoJS.lib.WordArray.random(IV_LENGTH)
  const encrypted = CryptoJS.AES.encrypt(text, encryptionKey, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })

  // Combine IV and encrypted data
  const combined = iv.concat(encrypted.ciphertext)
  return combined.toString(CryptoJS.enc.Base64)
}

export function decrypt(encryptedText: string): string {
  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedText)
    const iv = combined.clone()
    iv.sigBytes = IV_LENGTH
    iv.clamp()

    const encrypted = combined.clone()
    encrypted.words.splice(0, IV_LENGTH / 4)
    encrypted.sigBytes -= IV_LENGTH

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted } as any,
      encryptionKey,
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    )

    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

// Encrypt sensitive JSON data
export function encryptJson(data: any): string {
  return encrypt(JSON.stringify(data))
}

// Decrypt sensitive JSON data
export function decryptJson(encryptedData: string): any {
  const decrypted = decrypt(encryptedData)
  return JSON.parse(decrypted)
}

// Hash sensitive data (one-way encryption for passwords, etc.)
export function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString()
}

// Verify hashed data
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash
}
