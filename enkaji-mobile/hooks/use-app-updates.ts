import { useEffect, useState, useCallback, useRef } from "react"
import { Alert, AppState } from "react-native"
import * as Updates from "expo-updates"

export function useAppUpdates() {
  const [updateInfo, setUpdateInfo] = useState<{
    hasOtaUpdate: boolean
    isForceUpdate: boolean
    downloadUrl: string | null
    releaseNotes: string
  } | null>(null)
  const [checking, setChecking] = useState(false)
  const hasCheckedRef = useRef(false)

  const checkOtaUpdate = async (): Promise<boolean> => {
    try {
      if (__DEV__) return false
      const update = await Updates.checkForUpdateAsync()
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()
        return true
      }
      return false
    } catch (error) {
      console.error("OTA check failed:", error)
      return false
    }
  }

  const checkForUpdates = useCallback(async (silent = false) => {
    setChecking(true)
    try {
      const hasOta = await checkOtaUpdate()

      if (hasOta && !silent) {
        Alert.alert(
          "Update Available",
          "A new version has been downloaded. Restart the app to apply changes?",
          [
            { text: "Later", style: "cancel" },
            {
              text: "Restart Now",
              onPress: () => Updates.reloadAsync(),
            },
          ]
        )
      }

      setUpdateInfo({
        hasOtaUpdate: hasOta,
        isForceUpdate: false,
        downloadUrl: null,
        releaseNotes: "Bug fixes and improvements",
      })

      return hasOta
    } finally {
      setChecking(false)
    }
  }, [])

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
    updateInfo,
  }
}
