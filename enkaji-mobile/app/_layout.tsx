import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Colors } from '@/lib/theme'

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''

function RootLayoutContent() {
  const { isLoaded, isSignedIn } = useAuth()
  const [fontsLoaded] = useFonts({
    // Add custom fonts if needed
  })

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
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            headerShown: true,
            title: 'Product Details',
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerTintColor: Colors.text.primary,
          }} 
        />
        <Stack.Screen 
          name="checkout" 
          options={{ 
            headerShown: true,
            title: 'Checkout',
            headerStyle: {
              backgroundColor: Colors.background,
            },
            headerTintColor: Colors.text.primary,
          }} 
        />
        <Stack.Screen 
          name="seller/dashboard" 
          options={{ 
            headerShown: true,
            title: 'Seller Dashboard',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text.white,
          }} 
        />
        <Stack.Screen 
          name="seller/products" 
          options={{ 
            headerShown: true,
            title: 'My Products',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text.white,
          }} 
        />
        <Stack.Screen 
          name="admin/index" 
          options={{ 
            headerShown: true,
            title: 'Admin Panel',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: Colors.text.white,
          }} 
        />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SafeAreaProvider>
        <RootLayoutContent />
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

