import { useEffect, useState, useCallback, useRef } from "react"
import { Alert, AppState } from "react-native"
import * as Updates from "expo-updates"
import api from "@/lib/api"
import pkg from '../package.json'
import semver from 'semver'

export function useAppUpdates() {
  const [updateInfo, setUpdateInfo] = useState<{
    hasOtaUpdate: boolean
    isForceUpdate: boolean
    downloadUrl: string | null
    releaseNotes: string
    newVersion?: string
    currentVersion?: string
  } | null>(null)
  const [checking, setChecking] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [progress, setProgress] = useState(0)
  const hasCheckedRef = useRef(false)

  const currentVersion = (pkg as any).version || "1.0.0"

  const checkServerVersion = async (): Promise<{
    hasUpdate: boolean
    newVersion?: string
    forceUpdate?: boolean
    releaseNotes?: string
    downloadUrl?: string
  }> => {
    try {
      // Check version from backend API
      const data = await api.checkAppVersion()
      const { latestVersion, forceUpdate, releaseNotes, downloadUrl } = data

      const hasUpdate = latestVersion && semver.gt(latestVersion, currentVersion)
      
      // Report the check event
      api.reportUpdateEvent('update_checked', {
        currentVersion,
        latestVersion,
        hasUpdate,
      }).catch(() => {})
      
      return {
        hasUpdate: !!hasUpdate,
        newVersion: latestVersion,
        forceUpdate: forceUpdate || false,
        releaseNotes: releaseNotes || 'Bug fixes and improvements',
        downloadUrl: downloadUrl || null,
      }
    } catch (error) {
      console.log("[v0] Server version check failed (optional):", error)
      return { hasUpdate: false }
    }
  }

  const checkOtaUpdate = async (): Promise<boolean> => {
    try {
      if (__DEV__) return false
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        setProgress(30)
        await Updates.fetchUpdateAsync()
        setProgress(70)
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] OTA check failed:", error)
      return false
    }
  }

  const checkForUpdates = useCallback(async (silent = false) => {
    setChecking(true)
    setProgress(0)
    try {
      // Check both OTA and server version
      const [hasOta, serverVersion] = await Promise.all([
        checkOtaUpdate(),
        checkServerVersion(),
      ])

      // If OTA update was downloaded, report the download event
      if (hasOta) {
        api.reportUpdateEvent('update_downloaded', {
          newVersion: serverVersion.newVersion || 'unknown',
        }).catch(() => {})
      }

      const hasUpdate = hasOta || serverVersion.hasUpdate

      if (hasUpdate && !silent) {
        const message = serverVersion.forceUpdate
          ? "A critical update is required. Please update now to continue using the app."
          : `A new version ${serverVersion.newVersion} is available!\n\n${serverVersion.releaseNotes}`

        Alert.alert(
          serverVersion.forceUpdate ? "Required Update" : "Update Available",
          message,
          [
            !serverVersion.forceUpdate && { text: "Later", style: "cancel" },
             {
               text: serverVersion.forceUpdate ? "Update Now" : "Update Now",
               onPress: () => {
                 if (hasOta) {
                   api.reportUpdateEvent('update_installed', { newVersion: serverVersion.newVersion }).catch(() => {})
                   Updates.reloadAsync().catch(() => {
                     console.error("[v0] Failed to reload for update")
                   })
                 } else if (serverVersion.downloadUrl) {
                   // Open app store link
                   console.log("[v0] Opening store:", serverVersion.downloadUrl)
                 }
               },
             },
          ].filter(Boolean) as any[]
        )
      }

      setUpdateInfo({
        hasOtaUpdate: hasOta,
        isForceUpdate: serverVersion.forceUpdate || false,
        downloadUrl: serverVersion.downloadUrl || null,
        releaseNotes: serverVersion.releaseNotes || "Bug fixes and improvements",
        newVersion: serverVersion.newVersion,
        currentVersion,
      })

      setProgress(100)
      return hasUpdate
    } catch (error) {
      console.error("[v0] Update check error:", error)
      setProgress(0)
    } finally {
      setChecking(false)
      setTimeout(() => setProgress(0), 500)
    }
  }, [currentVersion])

  useEffect(() => {
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true
    checkForUpdates(true)

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        checkForUpdates(true)
      }
    })

    return () => subscription.remove()
  }, [checkForUpdates])

  return {
    checkForUpdates,
    checking,
    updating,
    progress,
    updateInfo,
    currentVersion,
  }
}
