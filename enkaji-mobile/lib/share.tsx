import * as Clipboard from 'expo-clipboard'
import { Alert } from 'react-native'
import * as Linking from 'expo-linking'
import { Product } from '@/types'

export async function shareProduct(product: Product) {
  const url = createProductUrl(product.id)
  const message = `Check out ${product.name} on Enkaji!\n\nKES ${product.price.toLocaleString()}\n${product.description?.slice(0, 100)}...\n\n${url}`

  try {
    // Copy to clipboard as primary sharing mechanism
    await Clipboard.setStringAsync(message)
    Alert.alert(
      'Link Copied',
      'Product link copied to clipboard. Share it anywhere!',
      [{ text: 'OK' }]
    )
  } catch (error) {
    console.error('Share failed:', error)
    Alert.alert('Error', 'Failed to share product. Please try again.')
  }
}

export function createProductUrl(productId: string): string {
  // Deep link for opening the app
  const deepLink = Linking.createURL(`/product/${productId}`)
  // Web fallback URL
  const webUrl = `https://enkaji.vercel.app/product/${productId}`
  // Return the web URL as the primary shareable link (works everywhere)
  return webUrl
}

export async function copyToClipboard(text: string) {
  await Clipboard.setStringAsync(text)
}

export function openProduct(productId: string) {
  const url = createProductUrl(productId)
  Linking.openURL(url).catch(err => {
    console.error('Failed to open product link:', err)
  })
}

// Share with specific channel (WhatsApp, SMS, Email)
export async function shareViaWhatsApp(product: Product) {
  const url = createProductUrl(product.id)
  const message = `Check out ${product.name} on Enkaji!\nKES ${product.price.toLocaleString()}\n${url}`
  
  const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}`
  
  try {
    await Linking.openURL(whatsappUrl)
  } catch (error) {
    Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to share via WhatsApp.')
  }
}

export async function shareViaSMS(product: Product) {
  const url = createProductUrl(product.id)
  const message = `Check out ${product.name} on Enkaji! KES ${product.price.toLocaleString()} ${url}`
  
  const smsUrl = `sms:?body=${encodeURIComponent(message)}`
  
  try {
    await Linking.openURL(smsUrl)
  } catch (error) {
    Alert.alert('Error', 'Failed to open SMS app.')
  }
}

export async function shareViaEmail(product: Product) {
  const url = createProductUrl(product.id)
  const subject = encodeURIComponent(product.name)
  const body = encodeURIComponent(`Check out this product on Enkaji!\n\n${product.name}\nKES ${product.price.toLocaleString()}\n\n${url}`)
  
  const emailUrl = `mailto:?subject=${subject}&body=${body}`
  
  try {
    await Linking.openURL(emailUrl)
  } catch (error) {
    Alert.alert('Error', 'Failed to open email app.')
  }
}
