/**
 * SplashScreen - Evim logo with animated gradient wave
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Typography } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { GradientLineWave } from '@/components/ui/GradientWave';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const { colors, isDark } = useTheme();
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const logoTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);
  const waveOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo animation
    logoOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));
    logoScale.value = withDelay(300, withSpring(1, { damping: 15, stiffness: 150 }));
    logoTranslateY.value = withDelay(300, withSpring(0, { damping: 15, stiffness: 150 }));
    
    // Tagline animation
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    
    // Wave animation
    waveOpacity.value = withDelay(500, withTiming(1, { duration: 800 }));

    // Navigate after splash
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const waveAnimatedStyle = useAnimatedStyle(() => ({
    opacity: waveOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      {/* Background gradient subtle effect */}
      <LinearGradient
        colors={
          isDark
            ? ['#0A0A0A', '#0A0A0A', '#0A84FF10']
            : ['#F7F7FC', '#F7F7FC', '#0A84FF08']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Logo Area */}
      <View style={styles.logoContainer}>
        <Animated.View style={logoAnimatedStyle}>
          {/* App Logo */}
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={[Colors.primary, '#0066CC']}
              style={styles.logoBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoIcon}>🏠</Text>
            </LinearGradient>
          </View>
          
          {/* App Name */}
          <Text style={[styles.logoText, { color: colors.text }]}>Evim</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.Text
          style={[styles.tagline, { color: colors.textSecondary }, taglineAnimatedStyle]}
        >
          Akıllı Ev Asistanın
        </Animated.Text>
      </View>

      {/* Bottom Wave Animation */}
      <Animated.View style={[styles.waveContainer, waveAnimatedStyle]}>
        <GradientLineWave speed={2500} />
      </Animated.View>

      {/* Version info */}
      <Text style={[styles.version, { color: colors.textTertiary }]}>
        v1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 48,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
    marginTop: 8,
  },
  tagline: {
    ...Typography.bodyLarge,
    marginTop: 8,
  },
  waveContainer: {
    position: 'absolute',
    bottom: 120,
    left: 40,
    right: 40,
  },
  version: {
    position: 'absolute',
    bottom: 50,
    ...Typography.labelSmall,
  },
});

