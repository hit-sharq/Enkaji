import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
} from 'react-native-reanimated'
import { Colors } from '@/lib/theme'

interface AnimatedListItemProps {
  children: React.ReactNode
  index?: number
  delay?: number
  style?: any
}

// Fade in from bottom with stagger
export function AnimateFadeInView({ 
  children, 
  delay = 0, 
  style 
}: AnimatedListItemProps & { style?: any }) {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue(20)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 300 })
    )
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 300, easing: (t) => t })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// Slide in from right
export function AnimateSlideInView({ 
  children, 
  delay = 0, 
  fromRight = true,
  style 
}: AnimatedListItemProps & { fromRight?: boolean; style?: any }) {
  const translateX = useSharedValue(fromRight ? 50 : -50)
  const opacity = useSharedValue(0)

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withTiming(0, { duration: 250, easing: (t) => t * t })
    )
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 250 })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// Scale bounce on appear
export function AnimateScaleIn({ 
  children, 
  delay = 0, 
  style 
}: AnimatedListItemProps & { style?: any }) {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, {
        damping: 12,
        stiffness: 200,
      })
    )
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 200 })
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  )
}

// Loading pulse animation
export function LoadingPulse({ 
  style 
}: { style?: any }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: (t) => t }),
        withTiming(0.3, { duration: 800, easing: (t) => t })
      ),
      -1,
      true
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View style={[styles.pulse, style, animatedStyle]} />
  )
}

// Card flip animation
interface FlipCardProps {
  front: React.ReactNode
  back: React.ReactNode
  isFlipped: boolean
  style?: any
}

export function FlipCard({ front, back, isFlipped, style }: FlipCardProps) {
  const rotateY = useSharedValue(0)

  useEffect(() => {
    rotateY.value = withTiming(isFlipped ? 180 : 0, { duration: 400 })
  }, [isFlipped])

  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value}deg` }],
    backfaceVisibility: 'hidden' as const,
  }))

  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotateY.value + 180}deg` }],
    backfaceVisibility: 'hidden' as const,
  }))

  return (
    <View style={[styles.flipContainer, style]}>
      <Animated.View style={[styles.flipFront, frontAnimatedStyle]}>
        {front}
      </Animated.View>
      <Animated.View style={[styles.flipBack, backAnimatedStyle]}>
        {back}
      </Animated.View>
    </View>
  )
}

// Staggered list animation wrapper
export function StaggeredList({ 
  children, 
  staggerDelay = 50 
}: { 
  children: React.ReactNode[]
  staggerDelay?: number 
}) {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <AnimateFadeInView delay={index * staggerDelay}>
          {child}
        </AnimateFadeInView>
      ))}
    </>
  )
}

const styles = StyleSheet.create({
  pulse: {
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  flipContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  flipFront: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  flipBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backfaceVisibility: 'hidden',
  },
})
