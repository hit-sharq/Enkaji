import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import { useAppUpdates } from "@/hooks/use-app-updates"
import { Colors } from "@/lib/theme"

export function UpdateBanner() {
  const { updateInfo, checking, checkForUpdates } = useAppUpdates()

  if (!updateInfo?.hasNativeUpdate) return null

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FontAwesome name="refresh" size={16} color={Colors.text.white} />
        <Text style={styles.text}>
          {updateInfo.isForceUpdate
            ? "Critical update required"
            : `Update available (build ${updateInfo.latestBuild})`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => checkForUpdates(false)}
        disabled={checking}
      >
        <FontAwesome name="download" size={16} color={Colors.text.white} />
        <Text style={styles.buttonText}>
          {checking ? "Checking..." : "Update"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  text: {
    color: Colors.text.white,
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: Colors.text.white,
    fontSize: 12,
    fontWeight: "600",
  },
})

