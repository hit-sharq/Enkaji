import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import { useAuthStore } from '@/lib/store'
import { Colors } from '@/lib/theme'

export default function SettingsScreen() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { user, logout } = useAuthStore()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => Alert.alert('Contact Support', 'Please contact support@enkaji.co.ke to delete your account.'),
        },
      ]
    )
  }

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut()
          logout()
          router.replace('/(auth)/sign-in')
        },
      },
    ])
  }

  const SettingRow = ({ icon, label, value, onPress, danger = false }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
          <Feather name={icon} size={16} color={danger ? Colors.error : Colors.primary} />
        </View>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      {value ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        <Feather name="chevron-right" size={18} color={Colors.text.tertiary} />
      )}
    </TouchableOpacity>
  )

  const ToggleRow = ({ icon, label, value, onChange }: any) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
          <Feather name={icon} size={16} color={Colors.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primary }}
        thumbColor="#fff"
      />
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitial}>
                {user.firstName?.[0] || user.email[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.profileName}>
                {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
              </Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <View style={styles.rolePill}>
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.section}>
          <ToggleRow icon="bell" label="Push Notifications" value={pushEnabled} onChange={setPushEnabled} />
          <View style={styles.divider} />
          <ToggleRow icon="mail" label="Email Updates" value={emailEnabled} onChange={setEmailEnabled} />
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.section}>
          <ToggleRow icon="moon" label="Dark Mode" value={darkMode} onChange={setDarkMode} />
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <SettingRow
            icon="lock"
            label="Change Password"
            onPress={() => Alert.alert('Change Password', 'A password reset link will be sent to your email.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Send Link', onPress: () => {} },
            ])}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy Policy', 'Visit enkaji.co.ke/privacy for our full privacy policy.')}
          />
          <View style={styles.divider} />
          <SettingRow
            icon="file-text"
            label="Terms of Service"
            onPress={() => Alert.alert('Terms of Service', 'Visit enkaji.co.ke/terms for our full terms of service.')}
          />
        </View>

        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.section}>
          <SettingRow icon="log-out" label="Sign Out" onPress={handleSignOut} danger />
          <View style={styles.divider} />
          <SettingRow icon="trash-2" label="Delete Account" onPress={handleDeleteAccount} danger />
        </View>

        <Text style={styles.version}>Enkaji Trade Kenya v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  content: { padding: 16, paddingBottom: 40 },
  profileCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: { fontSize: 22, fontWeight: '700', color: '#fff' },
  profileName: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  profileEmail: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  rolePill: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 8,
  },
  section: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxDanger: { backgroundColor: Colors.error + '15' },
  rowLabel: { fontSize: 15, color: Colors.text.primary },
  rowLabelDanger: { color: Colors.error },
  rowValue: { fontSize: 14, color: Colors.text.secondary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: 16 },
  version: { textAlign: 'center', color: Colors.text.tertiary, fontSize: 12, marginTop: 8 },
})
