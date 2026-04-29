import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import * as SecureStore from 'expo-secure-store'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Colors } from '@/lib/theme'
import { useAuthStore } from '@/lib/store'
import { useAppUpdates } from '@/hooks/use-app-updates'
import { UpdateBanner } from '@/components/update-banner'
import { NotificationProvider } from '@/hooks/use-notifications'
import api from '@/lib/api'
import type { UserRole } from '@/types'

SplashScreen.preventAutoHideAsync()

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key)
      return item
    } catch (error) {
      await SecureStore.deleteItemAsync(key)
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value)
    } catch (error) {
      return
    }
  },
}

function UserSyncComponent() {
  const { isSignedIn, getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const { setUser, logout } = useAuthStore()

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const syncUser = async () => {
        try {
          const token = await getToken()
          if (token) {
            api.setToken(token)
          }
          // Set basic info from Clerk immediately so UI isn't blank
          setUser({
            id: clerkUser.id,
            clerkId: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            imageUrl: clerkUser.imageUrl || null,
role: ((clerkUser.publicMetadata?.role as any) || 'BUYER') as UserRole,
          })
          // Then fetch the real role and data from our database
          try {
            const dbUser = await api.getUserProfile()
            if (dbUser && !dbUser.error) {
              setUser({
                id: dbUser.id,
                clerkId: dbUser.clerkId,
                email: dbUser.email,
                firstName: dbUser.firstName,
                lastName: dbUser.lastName,
                imageUrl: dbUser.imageUrl || clerkUser.imageUrl || null,
                role: dbUser.role,
              })
            }
          } catch (dbError) {
            console.warn('Could not fetch DB user profile, using Clerk data:', dbError)
          }
        } catch (error) {
          console.error('Error syncing user:', error)
        }
      }
      syncUser()
    } else if (!isSignedIn) {
      api.setToken(null)
      logout()
    }
  }, [isSignedIn, clerkUser])

  return null
}

function RootLayoutContent() {
  const { isLoaded } = useAuth()
  const [fontsLoaded] = useFonts({})
  
  // Initialize app update checking
  useAppUpdates()

  useEffect(() => {
    if (isLoaded && fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [isLoaded, fontsLoaded])

  if (!isLoaded || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <UserSyncComponent />
      <UpdateBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.text.white,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
         <Stack.Screen
           name="product/[id]"
           options={{
             headerShown: true,
             title: 'Product Details',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="services"
           options={{
             headerShown: true,
             title: 'Services',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="services/[id]"
           options={{
             headerShown: true,
             title: 'Service Details',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="bookings"
           options={{
             headerShown: true,
             title: 'My Bookings',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="bookings/[id]"
           options={{
             headerShown: true,
             title: 'Booking Details',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="providers/[slug]"
           options={{
             headerShown: true,
             title: 'Provider Profile',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
         <Stack.Screen
           name="checkout"
           options={{
             headerShown: true,
             title: 'Checkout',
             headerStyle: { backgroundColor: Colors.background },
             headerTintColor: Colors.text.primary,
           }}
         />
        <Stack.Screen
          name="payment-webview"
          options={{
            headerShown: true,
            title: 'Complete Payment',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="seller/dashboard"
          options={{
            headerShown: true,
            title: 'Seller Dashboard',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="seller/products"
          options={{
            headerShown: true,
            title: 'My Products',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="admin/index"
          options={{
            headerShown: true,
            title: 'Admin Panel',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="orders/[id]"
          options={{
            headerShown: true,
            title: 'Order Details',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="seller/orders"
          options={{
            headerShown: true,
            title: 'Customer Orders',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
        <Stack.Screen
          name="seller/payouts"
          options={{
            headerShown: true,
            title: 'Payouts',
            headerStyle: { backgroundColor: Colors.primary },
            headerTintColor: Colors.text.white,
          }}
        />
          <Stack.Screen
            name="seller/products/add"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="seller/products/edit"
            options={{
              headerShown: false,
            }}
          />
          {/* Provider (Services) Routes */}
         <Stack.Screen
           name="provider/dashboard"
           options={{
             headerShown: true,
             title: 'Provider Dashboard',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
         <Stack.Screen
           name="provider/services"
           options={{
             headerShown: true,
             title: 'My Services',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
         <Stack.Screen
           name="provider/services/add"
           options={{
             headerShown: true,
             title: 'Add Service',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
         <Stack.Screen
           name="provider/services/[id]"
           options={{
             headerShown: true,
             title: 'Edit Service',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
         <Stack.Screen
           name="provider/bookings"
           options={{
             headerShown: true,
             title: 'Service Bookings',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
         <Stack.Screen
           name="provider/availability"
           options={{
             headerShown: true,
             title: 'Availability',
             headerStyle: { backgroundColor: Colors.primary },
             headerTintColor: Colors.text.white,
           }}
         />
        <Stack.Screen
          name="favorites"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="help"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="shipping-addresses"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <SafeAreaProvider>
        <NotificationProvider>
          <RootLayoutContent />
        </NotificationProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
  },
})
