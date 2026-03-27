import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuthStore } from '@/lib/store'

const COLORS = {
  primary: '#8B2635',
  background: '#f8f9fa',
}

export default function RoleSelectScreen() {
  const router = useRouter()
  const { setRole } = useAuthStore()

  const handleRoleSelect = (role: 'customer' | 'driver') => {
    setRole(role)
    router.replace(role === 'customer' ? '/customer/home' : '/driver/home')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lumyn Flow</Text>
        <Text style={styles.subtitle}>Choose your role</Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handleRoleSelect('customer')}
          activeOpacity={0.8}
        >
          <View style={styles.iconBg}>
            <Feather name="package" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.cardTitle}>I'm a Customer</Text>
          <Text style={styles.cardDescription}>
            Request deliveries for your items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => handleRoleSelect('driver')}
          activeOpacity={0.8}
        >
          <View style={styles.iconBg}>
            <Feather name="truck" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.cardTitle}>I'm a Driver</Text>
          <Text style={styles.cardDescription}>
            Earn by delivering packages
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  cardsContainer: {
    gap: 20,
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
})
