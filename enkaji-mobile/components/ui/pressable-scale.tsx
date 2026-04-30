import React, { useRef } from 'react'
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

interface PressableScaleProps extends TouchableOpacityProps {
  scaleTo?: number
  scaleFrom?: number
  duration?: number
  feedback?: 'scale' | 'opacity' | 'none'
}

export function PressableScale({
  children,
  scaleTo = 0.95,
  scaleFrom = 1,
  duration = 150,
  feedback = 'scale',
  style,
  onPress,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(scaleFrom)
  const opacity = useSharedValue(1)

  const handlePressIn = () => {
    if (feedback === 'scale') {
      scale.value = withSpring(scaleTo, { damping: 15, stiffness: 400 })
    } else if (feedback === 'opacity') {
      opacity.value = withTiming(0.7, { duration })
    }
  }

  const handlePressOut = () => {
    if (feedback === 'scale') {
      scale.value = withSpring(scaleFrom, { damping: 15, stiffness: 400 })
    } else if (feedback === 'opacity') {
      opacity.value = withTiming(1, { duration })
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    if (feedback === 'scale') {
      return {
        transform: [{ scale: scale.value }],
      }
    }
    if (feedback === 'opacity') {
      return {
        opacity: opacity.value,
      }
    }
    return {}
  })

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={feedback === 'none' ? 1 : 0.8}
      {...props}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

// Haptic feedback wrapper (requires expo-haptics)
interface PressableHapticProps extends PressableScaleProps {
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection'
}

export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light') {
  try {
    const expoHaptics = require('expo-haptics')
    switch (type) {
      case 'light':
        expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Light)
        break
      case 'medium':
        expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Medium)
        break
      case 'heavy':
        expoHaptics.impactAsync(expoHaptics.ImpactFeedbackStyle.Heavy)
        break
      case 'selection':
        expoHaptics.selectionAsync()
        break
    }
  } catch (error) {
    // Haptics not available (e.g., simulator)
  }
}

export function PressableHaptic({
  children,
  hapticType = 'light',
  onPress,
  ...props
}: PressableHapticProps) {
  const handlePress = (event?: any) => {
    triggerHaptic(hapticType)
    onPress?.(event as any)
  }

  return (
    <PressableScale
      onPress={handlePress}
      {...props}
    >
      {children}
    </PressableScale>
  )
}

// Bounce button
interface PressableBounceProps extends Omit<PressableScaleProps, 'scaleTo' | 'scaleFrom'> {
  bounceAmount?: number
}

export function PressableBounce({
  children,
  bounceAmount = 10,
  ...props
}: PressableBounceProps) {
  const translateY = useSharedValue(0)

  const handlePressIn = () => {
    translateY.value = withSpring(bounceAmount, { damping: 10 })
  }

  const handlePressOut = () => {
    translateY.value = withSpring(0, { damping: 10, stiffness: 200 })
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      {...props}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  )
}

// Ripple effect (Material Design style)
import { Platform } from 'react-native'

export function PressableRipple({
  children,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  style,
  ...props
}: TouchableOpacityProps & { rippleColor?: string }) {
  return (
    <TouchableOpacity
      {...props}
      style={style}
      activeOpacity={0.8}
      // @ts-expect-error - android_ripple is valid at runtime
      android_ripple={{ color: rippleColor, borderless: false }}
    >
      {children}
    </TouchableOpacity>
  )
}
