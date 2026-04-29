import * as Sharing from 'expo-sharing'
import * as Clipboard from 'expo-clipboard'
import { Alert, Platform } from 'react-native'
import * as Linking from 'expo-linking'
import { Product } from '@/types'

export async function shareProduct(product: Product) {
  const url = createProductUrl(product.id)
  const message = `Check out ${product.name} on Enkaji!\n\nKES ${product.price.toLocaleString()}\n${product.description?.slice(0, 100)}...\n\n${url}`

  try {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(url, {
        message,
        // For Android, set the Dialog title
        dialogTitle: `Share ${product.name}`,
        // For iOS, set the subject of the share
        subject: product.name,
        // UTI for iOS (uniform type identifier) for text
        contentType: 'text/plain',
      })
    } else {
      // Fallback: copy to clipboard
      await Clipboard.setStringAsync(url)
      Alert.alert(
        'Link Copied',
        'Product link copied to clipboard. Share it anywhere!',
        [{ text: 'OK' }]
      )
    }
  } catch (error) {
    console.error('Share failed:', error)
    Alert.alert('Error', 'Failed to share product. Please try again.')
  }
}

export function createProductUrl(productId: string): string {
  const url = Linking.createURL(`/product/${productId}`, {
    scheme: 'enkaji',
    host: 'enkaji.vercel.app',
  })
  // Also support web fallback
  return `https://enkaji.vercel.app/product/${productId}`
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
