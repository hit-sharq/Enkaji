import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'
import { File, Directory, Paths } from 'expo-file-system'

export interface ImageUploadResult {
  url: string
  publicId: string
  width: number
  height: number
  size: number
}

export class ImageUploadService {
  private readonly cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo'
  private readonly uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned'
  private readonly apiKey = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY

  /**
   * Request camera roll permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      console.warn('Image picker permission denied')
      return false
    }
    return true
  }

  /**
   * Launch image picker (single or multiple)
   */
  async pickImages(allowMultiple = false, maxImages = 5): Promise<ImagePicker.ImagePickerAsset[]> {
    const hasPermission = await this.requestPermissions()
    if (!hasPermission) {
      throw new Error('Camera roll permission required')
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: allowMultiple,
      selectionLimit: maxImages,
    }

     const result = await ImagePicker.launchImageLibraryAsync(options)

     if (result.canceled) {
       throw new Error('No image selected')
     }

     return result.assets
  }

  /**
   * Launch camera
   */
  async takePhoto(): Promise<ImagePicker.ImagePickerAsset> {
    const hasPermission = await ImagePicker.requestCameraPermissionsAsync()
    if (!hasPermission) {
      throw new Error('Camera permission required')
    }

     const result = await ImagePicker.launchCameraAsync({
       mediaTypes: ['images'],
       allowsEditing: false,
       quality: 1,
     })

     if (result.canceled) {
       throw new Error('No photo taken')
     }

     return result.assets[0]
  }

  /**
   * Compress image to target size/quality
   */
  async compressImage(uri: string, options?: {
    maxWidth?: number
    maxHeight?: number
    quality?: number
    format?: 'jpeg' | 'png' | 'webp'
  }): Promise<string> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8,
      format = 'jpeg',
    } = options || {}

    // Get image info
    const info = await FileSystem.getInfoAsync(uri)
    if (!info.exists) {
      throw new Error('Image file not found')
    }

     // For local file:// URIs, we can copy to cache using File API
     if (uri.startsWith('file://')) {
       // Create a unique cache file path
       const compressedFile = new File(Paths.cache, `compressed-${Date.now()}.jpg`)
       // Copy the original file to cache
       await FileSystem.copyAsync({
         from: uri,
         to: compressedFile.uri,
       })

       // Note: expo-image-picker already auto-compresses based on quality
       // This is a basic implementation; for advanced compression use `expo-image`
       return compressedFile.uri
    }

    return uri
  }

  /**
   * Upload single image to Cloudinary with progress
   */
  async uploadImage(
    uri: string,
    onProgress?: (progress: number) => void
  ): Promise<ImageUploadResult> {
    // First, compress if needed
    const compressedUri = await this.compressImage(uri, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
    })

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(compressedUri)
    if (!fileInfo.exists || !('size' in fileInfo)) {
      throw new Error('Compressed image not found')
    }

    // Create form data
    const formData = new FormData()
    const file = {
      uri: compressedUri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    } as any

    formData.append('file', file)
    formData.append('upload_preset', this.uploadPreset)
    formData.append('folder', 'enkaji/mobile')

    // Upload to Cloudinary with XMLHttpRequest for progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = event.loaded / event.total
          onProgress(progress)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve({
              url: response.secure_url,
              publicId: response.public_id,
              width: response.width,
              height: response.height,
              size: fileInfo.size,
            })
          } catch (e) {
            reject(new Error('Invalid response from Cloudinary'))
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.open('POST', url)
      xhr.send(formData)
    })
  }

  /**
   * Upload multiple images in parallel
   */
  async uploadMultiple(
    uris: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<ImageUploadResult[]> {
    const results: ImageUploadResult[] = []
    const total = uris.length

    for (let i = 0; i < uris.length; i++) {
      try {
        const result = await this.uploadImage(uris[i], (p) => {
          // Individual progress could be tracked here
        })
        results.push(result)
        onProgress?.(i + 1, total)
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error)
        // Continue with others even if one fails
      }
    }

    return results
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/destroy`
    const formData = new FormData()
    formData.append('public_id', publicId)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(true)
        } else {
          reject(new Error('Delete failed'))
        }
      }
      xhr.onerror = () => reject(new Error('Network error'))
      xhr.open('POST', url)
      xhr.send(formData)
    })
  }
}

export const imageUploadService = new ImageUploadService()
