/**
 * TvCard Component - Smart TV device card with live status
 */

import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TvCardProps {
  name: string;
  room: string;
  isOn: boolean;
  currentChannel?: string;
  thumbnailUri?: string;
  onPress: () => void;
  onPowerPress?: () => void;
  delay?: number;
}

export function TvCard({
  name,
  room,
  isOn,
  currentChannel,
  thumbnailUri,
  onPress,
  onPowerPress,
  delay = 0,
}: TvCardProps) {
  const { colors, shadows, isDark } = useTheme();
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  // Pulse animation for live indicator
  React.useEffect(() => {
    if (isOn) {
      pulseOpacity.value = withRepeat(
        withTiming(0.4, { duration: 1000 }),
        -1,
        true
      );
    }
  }, [isOn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, SpringConfigs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const handlePowerPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPowerPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      entering={FadeIn.delay(delay).duration(400)}
    >
      <View style={[styles.card, { backgroundColor: colors.card }, shadows.medium]}>
        {/* TV Preview Area */}
        <View style={styles.previewContainer}>
          {thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={isOn ? [Colors.primary, '#1a1a2e'] : ['#2a2a2a', '#1a1a1a']}
              style={styles.placeholder}
            >
              <Ionicons
                name="tv-outline"
                size={48}
                color={isOn ? Colors.primary : colors.textTertiary}
              />
            </LinearGradient>
          )}

          {/* Live Indicator */}
          {isOn && (
            <View style={styles.liveContainer}>
              <Animated.View style={[styles.liveDot, pulseStyle]} />
              <Text style={styles.liveText}>CANLI</Text>
            </View>
          )}

          {/* Power Button */}
          <Pressable
            onPress={handlePowerPress}
            style={[
              styles.powerButton,
              { backgroundColor: isOn ? Colors.primary : colors.cardElevated },
            ]}
          >
            <Ionicons
              name="power"
              size={20}
              color={isOn ? '#FFFFFF' : colors.textTertiary}
            />
          </Pressable>
        </View>

        {/* Info Area */}
        <View style={styles.infoContainer}>
          <View style={styles.infoLeft}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {name}
            </Text>
            <Text style={[styles.room, { color: colors.textTertiary }]}>
              {room}
            </Text>
          </View>

          {isOn && currentChannel && (
            <View style={styles.channelBadge}>
              <Text style={styles.channelText}>{currentChannel}</Text>
            </View>
          )}
        </View>

        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isOn ? Colors.success : colors.textTertiary },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            {isOn ? 'Açık' : 'Kapalı'}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  previewContainer: {
    height: 180,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveContainer: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  powerButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  infoLeft: {
    flex: 1,
  },
  name: {
    ...Typography.titleMedium,
    marginBottom: 2,
  },
  room: {
    ...Typography.bodySmall,
  },
  channelBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  channelText: {
    color: '#FFFFFF',
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.labelSmall,
  },
});

