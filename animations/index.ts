/**
 * Evim - Animation Presets and Utilities
 * Using Reanimated for 60fps animations
 */

import {
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

// Spring configs
export const SpringConfigs = {
  // Snappy - quick response
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
  // Gentle - smooth, elegant
  gentle: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  // Bouncy - playful
  bouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.6,
  },
  // Stiff - no overshoot
  stiff: {
    damping: 30,
    stiffness: 400,
    mass: 1,
  },
};

// Timing configs
export const TimingConfigs = {
  fast: {
    duration: 150,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  normal: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  slow: {
    duration: 500,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  },
  // iOS-like curve
  easeInOut: {
    duration: 350,
    easing: Easing.bezier(0.42, 0, 0.58, 1),
  },
};

// Animation presets
export const AnimationPresets = {
  // Fade in
  fadeIn: (delay = 0) => ({
    entering: () => {
      'worklet';
      return {
        initialValues: { opacity: 0 },
        animations: { opacity: withDelay(delay, withTiming(1, TimingConfigs.normal)) },
      };
    },
  }),

  // Fade in up
  fadeInUp: (delay = 0, translateY = 20) => ({
    entering: () => {
      'worklet';
      return {
        initialValues: { opacity: 0, transform: [{ translateY }] },
        animations: {
          opacity: withDelay(delay, withTiming(1, TimingConfigs.normal)),
          transform: [{ translateY: withDelay(delay, withSpring(0, SpringConfigs.gentle)) }],
        },
      };
    },
  }),

  // Scale in
  scaleIn: (delay = 0) => ({
    entering: () => {
      'worklet';
      return {
        initialValues: { opacity: 0, transform: [{ scale: 0.9 }] },
        animations: {
          opacity: withDelay(delay, withTiming(1, TimingConfigs.fast)),
          transform: [{ scale: withDelay(delay, withSpring(1, SpringConfigs.snappy)) }],
        },
      };
    },
  }),

  // Slide in from right
  slideInRight: (delay = 0) => ({
    entering: () => {
      'worklet';
      return {
        initialValues: { transform: [{ translateX: 100 }], opacity: 0 },
        animations: {
          transform: [{ translateX: withDelay(delay, withSpring(0, SpringConfigs.gentle)) }],
          opacity: withDelay(delay, withTiming(1, TimingConfigs.fast)),
        },
      };
    },
  }),

  // Slide in from bottom
  slideInBottom: (delay = 0) => ({
    entering: () => {
      'worklet';
      return {
        initialValues: { transform: [{ translateY: 100 }], opacity: 0 },
        animations: {
          transform: [{ translateY: withDelay(delay, withSpring(0, SpringConfigs.gentle)) }],
          opacity: withDelay(delay, withTiming(1, TimingConfigs.fast)),
        },
      };
    },
  }),
};

// Staggered animation helper
export function createStaggeredDelay(index: number, baseDelay = 50): number {
  return index * baseDelay;
}

// Wave animation for gradient
export function createWaveAnimation(duration = 3000) {
  return withRepeat(
    withSequence(
      withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
      withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
    ),
    -1, // infinite
    true // reverse
  );
}

// Pulse animation
export function createPulseAnimation(minScale = 0.95, maxScale = 1.05, duration = 1500) {
  return withRepeat(
    withSequence(
      withTiming(maxScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      withTiming(minScale, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
}

// Breathing animation for mic
export function createBreathingAnimation(duration = 2000) {
  return withRepeat(
    withSequence(
      withTiming(1.15, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
}

// Export reanimated functions for convenience
export {
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  Extrapolation,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
};

