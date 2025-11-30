/**
 * AddTvScreen - Add new TV with QR scanner
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button, Card } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SCANNER_SIZE = SCREEN_WIDTH - Spacing.xl * 2;

export default function AddTvScreen() {
  const { colors, isDark } = useTheme();
  const [showManualInput, setShowManualInput] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [tvName, setTvName] = useState('');

  const scannerPulse = useSharedValue(1);
  const cornerOpacity = useSharedValue(0.5);

  useEffect(() => {
    // Scanner pulse animation
    scannerPulse.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Corner animation
    cornerOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const scannerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scannerPulse.value }],
  }));

  const cornerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
  }));

  const handleBack = () => {
    router.back();
  };

  const handleManualConnect = () => {
    if (ipAddress && tvName) {
      // Connect to TV via IP
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(100).duration(400)}
        style={styles.header}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Yeni TV Ekle
        </Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      {!showManualInput ? (
        <>
          {/* Instructions */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.instructions}
          >
            <Text style={[styles.instructionTitle, { color: colors.text }]}>
              QR Kodu Tarayın
            </Text>
            <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
              TV'nizin ayarlarında Evim uygulaması bölümünden QR kodunu açın ve tarayın
            </Text>
          </Animated.View>

          {/* QR Scanner Area */}
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.scannerContainer}
          >
            <Animated.View style={[styles.scannerArea, scannerAnimatedStyle]}>
              {/* Scanner placeholder with gradient border */}
              <LinearGradient
                colors={[Colors.primary, Colors.accent, Colors.primary]}
                style={styles.scannerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View
                  style={[
                    styles.scannerInner,
                    { backgroundColor: isDark ? '#1C1C1E' : '#F0F0F5' },
                  ]}
                >
                  {/* Corner markers */}
                  <Animated.View
                    style={[styles.cornerTopLeft, cornerAnimatedStyle]}
                  />
                  <Animated.View
                    style={[styles.cornerTopRight, cornerAnimatedStyle]}
                  />
                  <Animated.View
                    style={[styles.cornerBottomLeft, cornerAnimatedStyle]}
                  />
                  <Animated.View
                    style={[styles.cornerBottomRight, cornerAnimatedStyle]}
                  />

                  {/* Center icon */}
                  <Ionicons
                    name="qr-code-outline"
                    size={80}
                    color={colors.textTertiary}
                  />
                  <Text style={[styles.scannerText, { color: colors.textTertiary }]}>
                    QR kodu buraya hizalayın
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </Animated.View>

          {/* Manual Input Button */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.bottomSection}
          >
            <Button
              title="Manuel IP Gir"
              onPress={() => setShowManualInput(true)}
              variant="secondary"
              size="large"
              icon={<Ionicons name="keypad-outline" size={20} color={colors.text} />}
            />
          </Animated.View>
        </>
      ) : (
        /* Manual Input Form */
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.manualInputContainer}
        >
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Manuel Bağlantı
            </Text>
            <Text style={[styles.formDescription, { color: colors.textSecondary }]}>
              TV'nizin IP adresini ve ismini girin
            </Text>

            {/* TV Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                TV Adı
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="örn: Salon TV"
                placeholderTextColor={colors.textTertiary}
                value={tvName}
                onChangeText={setTvName}
              />
            </View>

            {/* IP Address Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                IP Adresi
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="örn: 192.168.1.100"
                placeholderTextColor={colors.textTertiary}
                value={ipAddress}
                onChangeText={setIpAddress}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formButtons}>
              <Button
                title="İptal"
                onPress={() => setShowManualInput(false)}
                variant="secondary"
                size="medium"
                style={styles.formButton}
              />
              <Button
                title="Bağlan"
                onPress={handleManualConnect}
                variant="primary"
                size="medium"
                style={styles.formButton}
                disabled={!ipAddress || !tvName}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Help text */}
      <View style={styles.helpSection}>
        <Ionicons name="help-circle-outline" size={20} color={colors.textTertiary} />
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          TV'nizi bulamıyor musunuz?{' '}
          <Text style={styles.helpLink}>Yardım alın</Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.titleLarge,
  },
  headerSpacer: {
    width: 44,
  },
  instructions: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  instructionTitle: {
    ...Typography.headlineSmall,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  instructionText: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  scannerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  scannerArea: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  scannerGradient: {
    flex: 1,
    padding: 3,
    borderRadius: BorderRadius.xl,
  },
  scannerInner: {
    flex: 1,
    borderRadius: BorderRadius.xl - 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scannerText: {
    ...Typography.bodyMedium,
    marginTop: Spacing.md,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.primary,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.primary,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: Colors.accent,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: Colors.accent,
    borderBottomRightRadius: 8,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  manualInputContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
  },
  formTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.xs,
  },
  formDescription: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyLarge,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.xs,
  },
  helpText: {
    ...Typography.bodySmall,
  },
  helpLink: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

