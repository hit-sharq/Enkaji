import { useEffect, useState, useCallback, useRef } from "react"
import { Alert, Linking, Platform, AppState } from "react-native"
import * as Updates from "expo-updates"
import Constants from "expo-constants"
import * as SecureStore from "expo-secure-store"

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://enkaji.vercel.app"
const LAST_PROMPTED_KEY = "enkaji_last_update_prompt"
const PROMPT_COOLDOWN_HOURS = 24

export interface VersionCheckResult {
  hasNativeUpdate: boolean
  hasOtaUpdate: boolean
  isForceUpdate: boolean
  downloadUrl: string | null
  releaseNotes: string
  currentBuild: number
  latestBuild: number
}

export function useAppUpdates() {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null)
  const [checking, setChecking] = useState(false)
  const hasCheckedRef = useRef(false)

  const getCurrentBuild = () => {
    return Constants.expoConfig?.android?.versionCode 
      || Constants.expoConfig?.ios?.buildNumber 
      || 1
  }

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

  const checkNativeUpdate = async (): Promise<VersionCheckResult | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mobile/version`)
      if (!response.ok) throw new Error("Version check failed")
      
      const { data } = await response.json()
      const currentBuild = Number(getCurrentBuild())
      const latestBuild = Number(data.buildNumber)
      const minRequired = Number(data.minRequiredBuild)

      return {
        hasNativeUpdate: latestBuild > currentBuild,
        hasOtaUpdate: false,
        isForceUpdate: currentBuild < minRequired,
        downloadUrl: data.apkUrl,
        releaseNotes: data.releaseNotes,
        currentBuild,
        latestBuild,
      }
    } catch (error) {
      console.error("Native update check failed:", error)
      return null
    }
  }

  const shouldPromptUser = async (): Promise<boolean> => {
    try {
      const lastPrompted = await SecureStore.getItemAsync(LAST_PROMPTED_KEY)
      if (!lastPrompted) return true
      const hoursSince = (Date.now() - Number(lastPrompted)) / (1000 * 60 * 60)
      return hoursSince >= PROMPT_COOLDOWN_HOURS
    } catch {
      return true
    }
  }

  const markPrompted = async () => {
    await SecureStore.setItemAsync(LAST_PROMPTED_KEY, Date.now().toString())
  }

  const downloadApk = async (url: string) => {
    try {
      if (Platform.OS === "android") {
        const supported = await Linking.canOpenURL(url)
        if (supported) {
          await Linking.openURL(url)
          Alert.alert(
            "Download Started",
            "Please install the new version when the download completes. You may need to allow installs from unknown sources."
          )
        } else {
          throw new Error("Cannot open download URL")
        }
      } else {
        Alert.alert("Update Available", "Please update from the App Store.")
      }
    } catch {
      Alert.alert(
        "Update Failed",
        "Could not open download link. Please visit our website to download the latest version."
      )
    }
  }

  const checkForUpdates = useCallback(async (silent = false) => {
    setChecking(true)
    try {
      const hasOta = await checkOtaUpdate()
      const nativeResult = await checkNativeUpdate()
      
      if (nativeResult) {
        const result = { ...nativeResult, hasOtaUpdate: hasOta }
        setUpdateInfo(result)

        if (result.isForceUpdate) {
          Alert.alert(
            "Update Required",
            `A critical update is required to continue using Enkaji.\n\n${result.releaseNotes}`,
            [
              {
                text: "Update Now",
                onPress: () => result.downloadUrl && downloadApk(result.downloadUrl),
              },
            ],
            { cancelable: false }
          )
          return result
        }

        if (result.hasNativeUpdate && !silent) {
          const canPrompt = await shouldPromptUser()
          if (canPrompt) {
            Alert.alert(
              "Update Available",
              `Version ${result.latestBuild} is available.\n\n${result.releaseNotes}`,
              [
                { text: "Later", style: "cancel" },
                {
                  text: "Update",
                  onPress: () => result.downloadUrl && downloadApk(result.downloadUrl),
                },
              ]
            )
            await markPrompted()
          }
        }

        if (hasOta && !result.hasNativeUpdate && !silent) {
          Alert.alert(
            "Update Installed",
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

        return result
      }

      return null
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
    downloadApk,
  }
}

