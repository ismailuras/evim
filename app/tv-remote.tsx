/**
 * TvRemoteScreen - Full screen TV remote control
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VOLUME_CONTROL_HEIGHT = 200;
const VOLUME_KNOB_SIZE = 60;

const channels = [
  { id: '1', name: 'TRT 1', number: 1 },
  { id: '2', name: 'ATV', number: 2 },
  { id: '3', name: 'Show TV', number: 3 },
  { id: '4', name: 'Star TV', number: 4 },
  { id: '5', name: 'Fox TV', number: 5 },
  { id: '6', name: 'Kanal D', number: 6 },
  { id: '7', name: 'TV8', number: 7 },
  { id: '8', name: 'NTV', number: 8 },
  { id: '9', name: 'CNN Türk', number: 9 },
  { id: '10', name: 'TRT Spor', number: 10 },
  { id: '11', name: 'beIN Sports', number: 11 },
  { id: '12', name: 'DMAX', number: 12 },
];

export default function TvRemoteScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [volume, setVolume] = useState(50);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [currentChannel, setCurrentChannel] = useState('TRT 1');

  const volumeY = useSharedValue(0);
  const powerScale = useSharedValue(1);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(Math.round(newVolume));
  }, []);

  const volumeGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = Math.max(
        -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
        Math.min(
          VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
          event.translationY + volumeY.value
        )
      );

      const normalizedVolume = interpolate(
        newY,
        [
          -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
          VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
        ],
        [100, 0],
        Extrapolation.CLAMP
      );

      runOnJS(handleVolumeChange)(normalizedVolume);
    })
    .onEnd((event) => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const volumeKnobStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      volume,
      [0, 100],
      [
        VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
        -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
      ],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const handlePowerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    powerScale.value = withSpring(0.9, SpringConfigs.snappy, () => {
      powerScale.value = withSpring(1, SpringConfigs.snappy);
    });
    setIsPowerOn(!isPowerOn);
  };

  const handleChannelPress = (channel: typeof channels[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentChannel(channel.name);
  };

  const handleBack = () => {
    router.back();
  };

  const powerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: powerScale.value }],
  }));

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

        {/* Header */}
        <Animated.View
          entering={FadeIn.delay(100).duration(400)}
          style={styles.header}
        >
          <Pressable onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.tvName, { color: colors.text }]}>
              Samsung QLED 55"
            </Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isPowerOn ? Colors.success : colors.textTertiary },
                ]}
              />
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                {isPowerOn ? 'Açık' : 'Kapalı'}
              </Text>
            </View>
          </View>
          <View style={styles.headerSpacer} />
        </Animated.View>

        {/* TV Preview */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.previewContainer}
        >
          <View style={[styles.preview, shadows.medium]}>
            {isPowerOn ? (
              <Image
                source={{ uri: 'https://picsum.photos/320/180' }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.previewOff, { backgroundColor: '#1a1a1a' }]}>
                <Ionicons name="tv-outline" size={40} color={colors.textTertiary} />
              </View>
            )}
            <View style={styles.previewOverlay}>
              <Text style={styles.channelName}>{currentChannel}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Main Controls Area */}
        <View style={styles.controlsArea}>
          {/* Left: Volume Control */}
          <Animated.View
            entering={FadeIn.delay(300).duration(500)}
            style={styles.volumeSection}
          >
            <Text style={[styles.volumeLabel, { color: colors.textSecondary }]}>
              Ses
            </Text>
            <View
              style={[
                styles.volumeTrack,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.volumeFill,
                  {
                    height: `${volume}%`,
                    backgroundColor: Colors.primary,
                  },
                ]}
              />
              <GestureDetector gesture={volumeGesture}>
                <Animated.View
                  style={[
                    styles.volumeKnob,
                    volumeKnobStyle,
                  ]}
                >
                  <LinearGradient
                    colors={[Colors.primary, '#0066CC']}
                    style={styles.volumeKnobGradient}
                  >
                    <Text style={styles.volumeValue}>{volume}</Text>
                  </LinearGradient>
                </Animated.View>
              </GestureDetector>
            </View>
            <View style={styles.volumeIcons}>
              <Ionicons name="volume-mute" size={20} color={colors.textTertiary} />
              <Ionicons name="volume-high" size={20} color={colors.textTertiary} />
            </View>
          </Animated.View>

          {/* Right: Power Button */}
          <Animated.View
            entering={FadeIn.delay(400).duration(500)}
            style={styles.powerSection}
          >
            <Animated.View style={powerAnimatedStyle}>
              <Pressable onPress={handlePowerPress}>
                <LinearGradient
                  colors={
                    isPowerOn
                      ? [Colors.primary, '#0066CC']
                      : [colors.card, colors.cardElevated]
                  }
                  style={styles.powerButton}
                >
                  <Ionicons
                    name="power"
                    size={36}
                    color={isPowerOn ? '#FFFFFF' : colors.textTertiary}
                  />
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Channel Grid */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.channelSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Kanallar
          </Text>
          <View style={styles.channelGrid}>
            {channels.map((channel) => (
              <Pressable
                key={channel.id}
                onPress={() => handleChannelPress(channel)}
                style={({ pressed }) => [
                  styles.channelButton,
                  {
                    backgroundColor:
                      currentChannel === channel.name
                        ? Colors.primary
                        : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                  shadows.small,
                ]}
              >
                <Text
                  style={[
                    styles.channelNumber,
                    {
                      color:
                        currentChannel === channel.name
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {channel.number}
                </Text>
                <Text
                  style={[
                    styles.channelButtonName,
                    {
                      color:
                        currentChannel === channel.name
                          ? '#FFFFFF'
                          : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {channel.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Navigation Controls */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.navSection}
        >
          <View style={styles.navControls}>
            <Pressable
              style={[styles.navButton, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="chevron-up" size={28} color={colors.text} />
            </Pressable>
            <View style={styles.navRow}>
              <Pressable
                style={[styles.navButton, { backgroundColor: colors.card }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name="chevron-back" size={28} color={colors.text} />
              </Pressable>
              <Pressable
                style={[styles.navButtonCenter, { backgroundColor: Colors.primary }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Text style={styles.navButtonCenterText}>OK</Text>
              </Pressable>
              <Pressable
                style={[styles.navButton, { backgroundColor: colors.card }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Ionicons name="chevron-forward" size={28} color={colors.text} />
              </Pressable>
            </View>
            <Pressable
              style={[styles.navButton, { backgroundColor: colors.card }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="chevron-down" size={28} color={colors.text} />
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  tvName: {
    ...Typography.titleMedium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.labelSmall,
  },
  headerSpacer: {
    width: 44,
  },
  previewContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  channelName: {
    color: '#FFFFFF',
    ...Typography.labelMedium,
  },
  controlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  volumeSection: {
    alignItems: 'center',
  },
  volumeLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.sm,
  },
  volumeTrack: {
    width: 8,
    height: VOLUME_CONTROL_HEIGHT,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  volumeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 4,
  },
  volumeKnob: {
    position: 'absolute',
    left: -26,
    width: VOLUME_KNOB_SIZE,
    height: VOLUME_KNOB_SIZE,
  },
  volumeKnobGradient: {
    flex: 1,
    borderRadius: VOLUME_KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  volumeValue: {
    color: '#FFFFFF',
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  volumeIcons: {
    flexDirection: 'column',
    marginTop: Spacing.sm,
    gap: VOLUME_CONTROL_HEIGHT - 40,
  },
  powerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  channelSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  channelButton: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 3) / 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  channelNumber: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  channelButtonName: {
    ...Typography.labelSmall,
    marginTop: 2,
  },
  navSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  navControls: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonCenterText: {
    color: '#FFFFFF',
    ...Typography.titleSmall,
    fontWeight: '700',
  },
});

