/**
 * RoomChip Component - Selectable room chip for filtering
 */

import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface RoomChipProps {
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onPress: () => void;
  deviceCount?: number;
}

export function RoomChip({
  name,
  icon,
  isSelected,
  onPress,
  deviceCount,
}: RoomChipProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const selected = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    selected.value = withSpring(isSelected ? 1 : 0, SpringConfigs.snappy);
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      selected.value,
      [0, 1],
      [isDark ? colors.card : colors.surface, Colors.primary]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      selected.value,
      [0, 1],
      [colors.text, '#FFFFFF']
    );

    return { color };
  });

  const iconColor = useDerivedValue(() => {
    return selected.value > 0.5 ? '#FFFFFF' : colors.textSecondary;
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SpringConfigs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        animatedStyle,
        !isSelected && { borderWidth: 1, borderColor: colors.border },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isSelected ? '#FFFFFF' : colors.textSecondary}
          style={styles.icon}
        />
      )}
      <Animated.Text style={[styles.text, textStyle]}>{name}</Animated.Text>
      {deviceCount !== undefined && (
        <Animated.View
          style={[
            styles.badge,
            {
              backgroundColor: isSelected
                ? 'rgba(255,255,255,0.25)'
                : colors.border,
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.badgeText,
              { color: isSelected ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {deviceCount}
          </Animated.Text>
        </Animated.View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    ...Typography.labelLarge,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
});

