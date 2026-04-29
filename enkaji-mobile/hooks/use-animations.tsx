import { useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated'
import { useEffect, useRef } from 'react'

interface UseAnimationsReturn {
  shake: () => void
  pulse: () => void
  bounce: () => void
  wiggle: () => void
}

export function useAnimations() {
  const shakeX = useRef(useSharedValue(0)).current
  const scale = useRef(useSharedValue(1)).current
  const translateY = useRef(useSharedValue(0)).current
  const rotate = useRef(useSharedValue(0)).current

  const shake = () => {
    'worklet'
    shakeX.value = withSequence(
      ...Array(5).fill(0).map((_, i) => 
        withTiming(i % 2 === 0 ? 10 : -10, { duration: 50 })
      ),
      withTiming(0, { duration: 50 })
    )
  }

  const pulse = () => {
    'worklet'
    scale.value = withSequence(
      withSpring(1.1, { damping: 5 }),
      withSpring(1, { damping: 10 })
    )
  }

  const bounce = () => {
    'worklet'
    translateY.value = withSequence(
      withTiming(-15, { duration: 150 }),
      withTiming(0, { duration: 150, easing: (t) => t * t })
    )
  }

  const wiggle = () => {
    'worklet'
    rotate.value = withSequence(
      ...Array(4).fill(0).map((_, i) => 
        withTiming(i % 2 === 0 ? 0.1 : -0.1, { duration: 80 })
      ),
      withTiming(0, { duration: 80 })
    )
  }

  return { shake, pulse, bounce, wiggle }
}

// Hook for staggered list entrance animation
export function useStaggerAnimation(
  itemCount: number,
  delay = 50,
  initialDelay = 0
) {
  const delays = useRef(
    Array.from({ length: itemCount }, (_, i) => initialDelay + i * delay)
  ).current

  return delays
}

// Hook for success/error shake animation on input fields
export function useShakeOnChange(shouldShake: boolean) {
  const shakeX = useSharedValue(0)

  useEffect(() => {
    if (shouldShake) {
      shakeX.value = withSequence(
        ...Array(5).fill(0).map((_, i) => 
          withTiming(i % 2 === 0 ? 8 : -8, { duration: 50 })
        ),
        withTiming(0, { duration: 50 })
      )
    }
  }, [shouldShake])

  const animatedStyle = {
    transform: [{ translateX: shakeX }],
  }

  return animatedStyle
}
