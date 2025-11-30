/**
 * GradientWave Component - Animated gradient wave for splash screen
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVE_WIDTH = SCREEN_WIDTH * 2;
const WAVE_HEIGHT = 100;

interface GradientWaveProps {
  height?: number;
  speed?: number;
}

export function GradientWave({ height = 100, speed = 3000 }: GradientWaveProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    // Wave movement
    translateX.value = withRepeat(
      withTiming(-SCREEN_WIDTH, {
        duration: speed,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Opacity pulse
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: speed / 2, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: speed / 2, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const createWavePath = (amplitude: number, frequency: number, phase: number) => {
    let path = `M 0 ${WAVE_HEIGHT / 2}`;
    for (let x = 0; x <= WAVE_WIDTH; x += 5) {
      const y =
        WAVE_HEIGHT / 2 +
        amplitude * Math.sin((x * frequency * Math.PI) / SCREEN_WIDTH + phase);
      path += ` L ${x} ${y}`;
    }
    path += ` L ${WAVE_WIDTH} ${WAVE_HEIGHT} L 0 ${WAVE_HEIGHT} Z`;
    return path;
  };

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.waveContainer, animatedStyle]}>
        <Svg width={WAVE_WIDTH} height={WAVE_HEIGHT} viewBox={`0 0 ${WAVE_WIDTH} ${WAVE_HEIGHT}`}>
          {/* Background wave - Orange */}
          <Path
            d={createWavePath(15, 2, 0)}
            fill={Colors.accent}
            opacity={0.4}
          />
          {/* Middle wave - Gradient blend */}
          <Path
            d={createWavePath(20, 3, Math.PI / 4)}
            fill={Colors.primary}
            opacity={0.5}
          />
          {/* Front wave - Blue */}
          <Path
            d={createWavePath(12, 4, Math.PI / 2)}
            fill={Colors.primary}
            opacity={0.7}
          />
        </Svg>
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.1)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
    </View>
  );
}

// Alternative: Simple gradient line wave
export function GradientLineWave({ speed = 2000 }: { speed?: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: speed,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-50, 50]);
    const scaleX = interpolate(progress.value, [0, 0.5, 1], [0.8, 1.2, 0.8]);

    return {
      transform: [{ translateX }, { scaleX }],
    };
  });

  return (
    <View style={styles.lineContainer}>
      <Animated.View style={[styles.lineWave, animatedStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.accent, Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.lineGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  waveContainer: {
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT,
  },
  lineContainer: {
    width: '100%',
    height: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  lineWave: {
    width: '80%',
    height: '100%',
  },
  lineGradient: {
    flex: 1,
    borderRadius: 2,
  },
});

