import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as Updates from "expo-updates"
import { useAppUpdates } from "@/hooks/use-app-updates"
import { Colors } from "@/lib/theme"
import { useState, useEffect } from "react"

export function UpdateBanner() {
  const { updateInfo, checking, progress, checkForUpdates } = useAppUpdates()
  const [displayProgress, setDisplayProgress] = useState(progress)
  const progressAnim = new Animated.Value(0)

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: displayProgress,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [displayProgress])

  useEffect(() => {
    setDisplayProgress(progress)
  }, [progress])

  if (!updateInfo?.hasOtaUpdate && !updateInfo?.isForceUpdate) return null

  const isCritical = updateInfo?.isForceUpdate
  const containerBg = isCritical ? '#c73e1d' : Colors.primary

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={isCritical ? "alert-circle" : "update"} 
            size={18} 
            color={Colors.text.white} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isCritical ? "Update Required" : "Update Available"}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {updateInfo?.newVersion ? `v${updateInfo.newVersion}` : "New version ready"}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isCritical ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.2)' }]}
        onPress={() => Updates.reloadAsync()}
        disabled={checking}
      >
        {checking ? (
          <>
            <MaterialCommunityIcons name="loading" size={14} color={Colors.text.white} />
            <Text style={styles.buttonText}>Installing...</Text>
          </>
        ) : (
          <>
            <MaterialCommunityIcons name="download" size={14} color={Colors.text.white} />
            <Text style={styles.buttonText}>Install</Text>
          </>
        )}
      </TouchableOpacity>

      {checking && progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${displayProgress}%` }]} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.text.white,
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
  },
  buttonText: {
    color: Colors.text.white,
    fontSize: 13,
    fontWeight: "600",
  },
  progressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.text.white,
    borderRadius: 1,
  },
})

