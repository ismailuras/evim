/**
 * AuthScreen - Apple/Google sign-in + Email authentication
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { SpringConfigs } from '@/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AuthScreen() {
  const { colors, isDark } = useTheme();
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withDelay(200, withSpring(1, SpringConfigs.gentle));
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const handleAppleSignIn = () => {
    // Apple sign-in logic
    router.replace('/(tabs)');
  };

  const handleGoogleSignIn = () => {
    // Google sign-in logic
    router.replace('/(tabs)');
  };

  const handleEmailSignIn = () => {
    // Navigate to email auth flow
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ['#0A84FF15', '#0A0A0A', '#FF9F0A10']
            : ['#0A84FF10', '#F7F7FC', '#FF9F0A08']
        }
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={[styles.circle1, { opacity: isDark ? 0.1 : 0.15 }]} />
      <View style={[styles.circle2, { opacity: isDark ? 0.1 : 0.15 }]} />

      {/* Header Section */}
      <View style={styles.headerSection}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <LinearGradient
            colors={[Colors.primary, '#0066CC']}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.logoIcon}>🏠</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={[styles.title, { color: colors.text }]}
        >
          Evim'e Hoş Geldin
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(500).duration(500)}
          style={[styles.subtitle, { color: colors.textSecondary }]}
        >
          Akıllı evini yönetmeye başla
        </Animated.Text>
      </View>

      {/* Auth Buttons Section */}
      <Animated.View
        entering={FadeIn.delay(600).duration(500)}
        style={styles.authSection}
      >
        {/* Apple Sign In */}
        <Pressable
          onPress={handleAppleSignIn}
          style={[
            styles.socialButton,
            {
              backgroundColor: isDark ? '#FFFFFF' : '#000000',
            },
          ]}
        >
          <Ionicons
            name="logo-apple"
            size={24}
            color={isDark ? '#000000' : '#FFFFFF'}
          />
          <Text
            style={[
              styles.socialButtonText,
              { color: isDark ? '#000000' : '#FFFFFF' },
            ]}
          >
            Apple ile Devam Et
          </Text>
        </Pressable>

        {/* Google Sign In */}
        <Pressable
          onPress={handleGoogleSignIn}
          style={[
            styles.socialButton,
            {
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Ionicons name="logo-google" size={22} color="#EA4335" />
          <Text style={[styles.socialButtonText, { color: colors.text }]}>
            Google ile Devam Et
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>
            veya
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        {/* Email Sign In */}
        <Button
          title="E-posta ile Devam Et"
          onPress={handleEmailSignIn}
          variant="outline"
          size="large"
          fullWidth
          icon={<Ionicons name="mail-outline" size={20} color={Colors.primary} />}
        />
      </Animated.View>

      {/* Terms */}
      <Animated.View
        entering={FadeIn.delay(800).duration(500)}
        style={styles.termsSection}
      >
        <Text style={[styles.termsText, { color: colors.textTertiary }]}>
          Devam ederek{' '}
          <Text style={styles.termsLink}>Kullanım Şartları</Text>
          {' '}ve{' '}
          <Text style={styles.termsLink}>Gizlilik Politikası</Text>
          'nı kabul etmiş olursunuz.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
  },
  circle2: {
    position: 'absolute',
    bottom: -50,
    left: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
  },
  headerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoGradient: {
    width: 90,
    height: 90,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 44,
  },
  title: {
    ...Typography.headlineLarge,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
  authSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  socialButtonText: {
    ...Typography.labelLarge,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    ...Typography.labelMedium,
    marginHorizontal: Spacing.md,
  },
  termsSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
  },
  termsText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

