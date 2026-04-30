import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  visible: boolean
  onDismiss?: () => void
}

const toastConfig = {
  success: {
    backgroundColor: '#27ae60',
    icon: 'check-circle',
    color: '#fff',
  },
  error: {
    backgroundColor: '#e74c3c',
    icon: 'alert-circle',
    color: '#fff',
  },
  info: {
    backgroundColor: '#3498db',
    icon: 'information',
    color: '#fff',
  },
  warning: {
    backgroundColor: '#f39c12',
    icon: 'alert',
    color: '#fff',
  },
}

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onDismiss,
}: ToastProps) {
  const [opacity] = useState(new Animated.Value(0))
  const config = toastConfig[type]

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss?.()
      })
    }
  }, [visible, opacity, duration, onDismiss])

  if (!visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          opacity,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon as any}
        size={24}
        color={config.color}
        style={styles.icon}
      />
      <Text style={[styles.message, { color: config.color }]}>
        {message}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
})
