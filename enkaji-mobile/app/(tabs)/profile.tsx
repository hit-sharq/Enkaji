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
import { useRBAC } from '@/lib/rbac'
import api from '@/lib/api'
import { Colors } from '@/lib/theme'

const PLACEHOLDER_IMAGE = 'https://placehold.co/200x200/e5e5e5/666666?text=User'

export default function ProfileScreen() {
  const router = useRouter()
  const { isSignedIn, signOut } = useAuth()
  const { user, setUser, logout, isSellerApproved } = useAuthStore()
  const { canAccessSeller, canAccessAdmin } = useRBAC()
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

  const handleSellerAccess = () => {
    const access = canAccessSeller()
    if (!access.canAccess) {
      Alert.alert('Access Denied', access.message)
      return
    }
    router.push('/seller/dashboard')
  }

  const menuItems = [
    { 
      icon: 'shopping-bag', 
      label: 'My Orders', 
      onPress: () => router.push('/(tabs)/orders'),
      show: true 
    },
    { 
      icon: 'heart', 
      label: 'Favourites', 
      onPress: () => router.push('/favorites'),
      show: true 
    },
    { 
      icon: 'map-pin', 
      label: 'Shipping Addresses', 
      onPress: () => router.push('/shipping-addresses'),
      show: true 
    },
    { 
      icon: 'bell', 
      label: 'Notifications', 
      onPress: () => router.push('/notifications'),
      show: true 
    },
    { 
      icon: 'layout', 
      label: 'Seller Dashboard',
      onPress: handleSellerAccess,
      show: user?.role === 'SELLER' || user?.role === 'ADMIN',
      badge: isSellerApproved ? null : 'Pending'
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
        {/* Hero Section */}
        <View style={styles.authHero}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>E</Text>
          </View>
          <Text style={styles.brandName}>Enkaji</Text>
          <Text style={styles.heroTagline}>Kenya's Trusted Marketplace</Text>
        </View>

        <View style={styles.authPrompt}>
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header with Brand Colors */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.imageUrl || PLACEHOLDER_IMAGE }}
            style={styles.avatar}
          />
          <View style={styles.avatarBadge}>
            <Feather name="camera" size={14} color={Colors.text.white} />
          </View>
        </View>
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
          <View style={styles.statIconContainer}>
            <Feather name="shopping-bag" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem} onPress={() => router.push('/favorites')}>
          <View style={styles.statIconContainer}>
            <Feather name="heart" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Feather name="star" size={20} color={Colors.primary} />
          </View>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Account</Text>
        {menuItems.filter(item => item.show).map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Feather name={item.icon as any} size={18} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>{item.label}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={Colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Sign Out */}
      <TouchableOpacity 
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <View style={styles.menuIconContainer}>
          <Feather name="log-out" size={18} color={Colors.error} />
        </View>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Enkaji Marketplace</Text>
        <Text style={styles.footerSubtext}>Kenya's Premier B2B & B2C Platform</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  // Auth Hero Section
  authHero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.text.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text.white,
    letterSpacing: 1,
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
  },
  authPrompt: {
    alignItems: 'center',
    padding: 30,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  authText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginBottom: 30,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  signInButtonText: {
    color: Colors.text.white,
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: Colors.text.white,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  signUpButtonText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 17,
    textAlign: 'center',
  },
  // Logged in header
  header: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 3,
    borderColor: Colors.text.white,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.text.white,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.white,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    backgroundColor: Colors.text.white,
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
  // Menu
  menuContainer: {
    backgroundColor: Colors.background,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.tertiary,
    paddingVertical: 16,
    paddingHorizontal: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    marginTop: 16,
    marginHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 4,
  },
})

