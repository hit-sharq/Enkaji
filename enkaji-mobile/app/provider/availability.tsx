import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Switch,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'
import { WorkingHour } from '@/types'

const DAYS = [
  { key: 'monday', label: 'Monday', dayOfWeek: 1 },
  { key: 'tuesday', label: 'Tuesday', dayOfWeek: 2 },
  { key: 'wednesday', label: 'Wednesday', dayOfWeek: 3 },
  { key: 'thursday', label: 'Thursday', dayOfWeek: 4 },
  { key: 'friday', label: 'Friday', dayOfWeek: 5 },
  { key: 'saturday', label: 'Saturday', dayOfWeek: 6 },
  { key: 'sunday', label: 'Sunday', dayOfWeek: 7 },
]

export default function AvailabilityScreen() {
  const router = useRouter()
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadHours()
  }, [])

  const loadHours = async () => {
    setIsLoading(true)
    try {
      const response = await api.getWorkingHours()
      if (Array.isArray(response)) {
        setWorkingHours(response)
      } else if (response?.workingHours) {
        setWorkingHours(response.workingHours)
      } else {
        // Initialize with defaults if no data
        setWorkingHours(
          DAYS.map((d) => ({
            day: d.key,
            dayOfWeek: d.dayOfWeek,
            openTime: '09:00',
            closeTime: '17:00',
            isOpen: true,
          }))
        )
      }
    } catch (error) {
      console.error('Error loading working hours:', error)
      // Fallback defaults
      setWorkingHours(
        DAYS.map((d) => ({
          day: d.key,
          dayOfWeek: d.dayOfWeek,
          openTime: '09:00',
          closeTime: '17:00',
          isOpen: true,
        }))
      )
    } finally {
      setIsLoading(false)
    }
  }

  const updateDay = (dayKey: string, updates: Partial<WorkingHour>) => {
    setWorkingHours((prev) =>
      prev.map((wh) => (wh.day === dayKey ? { ...wh, ...updates } : wh))
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Prepare payload with only fields expected by API
      const payload = workingHours.map(({ dayOfWeek, openTime, closeTime, isOpen }) => ({
        dayOfWeek,
        openTime: openTime || '',
        closeTime: closeTime || '',
        isOpen,
      }))
      const response = await api.updateWorkingHours(payload)
      if (response.success) {
        Alert.alert('Success', 'Your availability has been updated.', [{ text: 'OK' }])
      } else {
        Alert.alert('Error', response.error || 'Failed to update availability')
      }
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.error || 'Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const isAllClosed = workingHours.every((wh) => !wh.isOpen)

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Availability</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Set your regular working hours. Customers will see your availability when booking.
        </Text>

        {DAYS.map((dayObj) => {
          const wh = workingHours.find((w) => w.day === dayObj.key) || {
            day: dayObj.key,
            dayOfWeek: dayObj.dayOfWeek,
            openTime: '09:00',
            closeTime: '17:00',
            isOpen: false,
          }

          return (
            <View key={dayObj.key} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayName}>{dayObj.label}</Text>
                <Switch
                  value={wh.isOpen}
                  onValueChange={(val) => updateDay(dayObj.key, { isOpen: val })}
                  trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
                  thumbColor="#fff"
                />
              </View>

              {wh.isOpen && (
                <View style={styles.timeRow}>
                  <View style={styles.timeField}>
                    <Text style={styles.timeLabel}>Opens</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={wh.openTime || ''}
                      onChangeText={(t) => updateDay(dayObj.key, { openTime: t })}
                      placeholder="09:00"
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                  <Text style={styles.timeSeparator}>to</Text>
                  <View style={styles.timeField}>
                    <Text style={styles.timeLabel}>Closes</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={wh.closeTime || ''}
                      onChangeText={(t) => updateDay(dayObj.key, { closeTime: t })}
                      placeholder="17:00"
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                </View>
              )}
            </View>
          )
        })}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => {
              setWorkingHours(
                DAYS.map((d) => ({
                  day: d.key,
                  dayOfWeek: d.dayOfWeek,
                  openTime: '09:00',
                  closeTime: '17:00',
                  isOpen: true,
                }))
              )
            }}
          >
            <Feather name="sunrise" size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Set All Open</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => {
              setWorkingHours(
                DAYS.map((d) => ({
                  ...workingHours.find((wh) => wh.day === d.key)!,
                  isOpen: false,
                }))
              )
            }}
          >
            <Feather name="moon" size={16} color={Colors.text.secondary} />
            <Text style={[styles.quickActionText, { color: Colors.text.secondary }]}>Set All Closed</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Feather name="save" size={18} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundSecondary },
  loadingText: { marginTop: 12, color: Colors.text.tertiary, fontSize: 14 },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  back: { width: 40, alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { padding: 16 },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 12,
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.text.tertiary,
    fontWeight: '500',
    marginBottom: 6,
  },
  timeInput: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  timeSeparator: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginTop: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 20,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
})
