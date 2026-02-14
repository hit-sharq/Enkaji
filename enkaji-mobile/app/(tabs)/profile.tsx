import { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useAuth } from '@clerk/clerk-expo'
import { useAuthStore } from '@/lib/store'
import api from '@/lib/api'

const PLACEHOLDER_IMAGE = 'https://placehold.co/200x200/e5e5e5/666666?text=User'

export default function ProfileScreen() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { user, setUser, logout } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut()
            logout()
            router.replace('/(auth)/sign-in')
          }
        },
      ]
    )
  }

  const menuItems = [
    { 
      icon: 'shopping-bag', 
      label: 'My Orders', 
      onPress: () => router.push('/orders'),
      show: true 
    },
    { 
      icon: 'heart', 
      label: 'Favorites', 
      onPress: () => router.push('/favorites'),
      show: true 
    },
    { 
      icon: 'map-pin', 
      label: 'Shipping Addresses', 
      onPress: () => Alert.alert('Coming Soon', 'Address management coming soon!'),
      show: true 
    },
    { 
      icon: 'credit-card', 
      label: 'Payment Methods', 
      onPress: () => Alert.alert('Coming Soon', 'Payment methods coming soon!'),
      show: true 
    },
    { 
      icon: 'bell', 
      label: 'Notifications', 
      onPress: () => Alert.alert('Coming Soon', 'Notifications settings coming soon!'),
      show: true 
    },
    { 
      icon: 'store', 
      label: 'Become a Seller', 
      onPress: () => router.push('/sell'),
      show: user?.role !== 'SELLER' 
    },
    { 
      icon: 'layout', 
      label: 'Seller Dashboard', 
      onPress: () => router.push('/seller/dashboard'),
      show: user?.role === 'SELLER' || user?.role === 'ADMIN'
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      onPress: () => router.push('/settings'),
      show: true 
    },
    { 
      icon: 'help-circle', 
      label: 'Help & Support', 
      onPress: () => router.push('/help'),
      show: true 
    },
  ]

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Feather name="user" size={64} color="#ccc" />
          <Text style={styles.authTitle}>Welcome to Enkaji</Text>
          <Text style={styles.authText}>Sign in to access your account</Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => router.push('/(auth)/sign-up')}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: user?.imageUrl || PLACEHOLDER_IMAGE }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>
          {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User'}
        </Text>
        <Text style={styles.userEmail}>{user?.email || ''}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role || 'BUYER'}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={() => router.push('/orders')}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem} onPress={() => router.push('/favorites')}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.filter(item => item.show).map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Feather name={item.icon as any} size={20} color="#000" />
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Feather name="log-out" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Enkaji Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
  },
  authText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    marginTop: 30,
    backgroundColor: '#000',
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 25,
  },
  signInButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  signUpButton: {
    marginTop: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 50,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
  },
  signUpButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e5e5',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    marginTop: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 15,
  },
  signOutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
})

