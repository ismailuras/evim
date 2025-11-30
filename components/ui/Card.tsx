/**
 * Card Component - Premium card with shadow and animations
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  elevated?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  animated?: boolean;
  delay?: number;
}

export function Card({
  children,
  onPress,
  style,
  elevated = false,
  padding = 'medium',
  animated = true,
  delay = 0,
}: CardProps) {
  const { colors, shadows, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, SpringConfigs.snappy);
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, SpringConfigs.snappy);
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const paddingValue = getPaddingValue(padding);
  const shadowStyle = elevated ? shadows.medium : shadows.small;

  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardElevated : colors.card,
          padding: paddingValue,
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
        entering={animated ? FadeIn.delay(delay).duration(300) : undefined}
      >
        {cardContent}
      </AnimatedPressable>
    );
  }

  if (animated) {
    return (
      <Animated.View
        entering={FadeIn.delay(delay).duration(300)}
        style={animatedStyle}
      >
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
}

function getPaddingValue(padding: CardProps['padding']): number {
  switch (padding) {
    case 'none':
      return 0;
    case 'small':
      return Spacing.sm;
    case 'large':
      return Spacing.lg;
    default:
      return Spacing.md;
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
});

