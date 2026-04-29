import { useState, useCallback } from 'react'
import { Alert, Platform } from 'react-native'
import { imageUploadService, ImageUploadResult } from '@/lib/image-upload'

export function useImageUpload(options?: {
  maxImages?: number
  allowMultiple?: boolean
  onUploadStart?: () => void
  onUploadProgress?: (progress: number) => void
  onUploadComplete?: (results: ImageUploadResult[]) => void
  onUploadError?: (error: Error) => void
}) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedImages, setSelectedImages] = useState<string[]>([])

  const pickImages = useCallback(async () => {
    try {
      const assets = await imageUploadService.pickImages(options?.allowMultiple, options?.maxImages)
      setSelectedImages(assets.map(a => a.uri))
      return assets
    } catch (error: any) {
      if (error.message !== 'No image selected') {
        Alert.alert('Error', error.message)
      }
      throw error
    }
  }, [options?.allowMultiple, options?.maxImages])

  const takePhoto = useCallback(async () => {
    try {
      const asset = await imageUploadService.takePhoto()
      setSelectedImages([asset.uri])
      return asset
    } catch (error: any) {
      Alert.alert('Error', error.message)
      throw error
    }
  }, [])

  const uploadImages = useCallback(async (uris?: string[]) => {
    const imagesToUpload = uris || selectedImages
    if (imagesToUpload.length === 0) {
      Alert.alert('No Images', 'Please select images first')
      return null as any
    }

    setIsUploading(true)
    setUploadProgress(0)
    options?.onUploadStart?.()

    try {
      const results = await imageUploadService.uploadMultiple(imagesToUpload, (completed, total) => {
        const progress = completed / total
        setUploadProgress(progress)
        options?.onUploadProgress?.(progress)
      })

      setSelectedImages([])
      options?.onUploadComplete?.(results)
      return results
    } catch (error: any) {
      options?.onUploadError?.(error)
      Alert.alert('Upload Failed', error.message)
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }, [selectedImages, options])

  const clearSelection = useCallback(() => {
    setSelectedImages([])
  }, [])

  return {
    isUploading,
    uploadProgress,
    selectedImages,
    pickImages,
    takePhoto,
    uploadImages,
    clearSelection,
  }
}
