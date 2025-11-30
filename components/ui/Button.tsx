/**
 * Button Component - Premium styled button with variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Colors, BorderRadius, Typography, Spacing } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'apple' | 'google';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, SpringConfigs.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfigs.snappy);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant, colors, isDark);

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text
            style={[
              styles.text,
              sizeStyles.text,
              { color: variantStyles.textColor },
              icon && iconPosition === 'left' ? { marginLeft: Spacing.sm } : undefined,
              icon && iconPosition === 'right' ? { marginRight: Spacing.sm } : undefined,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <AnimatedTouchable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth]}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            sizeStyles.button,
            disabled && styles.disabled,
            style,
          ]}
        >
          {content}
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
    >
      {content}
    </AnimatedTouchable>
  );
}

function getSizeStyles(size: ButtonSize) {
  switch (size) {
    case 'small':
      return {
        button: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.md,
        },
        text: {
          ...Typography.labelMedium,
        },
      };
    case 'large':
      return {
        button: {
          paddingVertical: Spacing.md + 2,
          paddingHorizontal: Spacing.xl,
          borderRadius: BorderRadius.lg,
        },
        text: {
          ...Typography.titleSmall,
        },
      };
    default: // medium
      return {
        button: {
          paddingVertical: Spacing.md - 2,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.lg,
        },
        text: {
          ...Typography.labelLarge,
        },
      };
  }
}

function getVariantStyles(variant: ButtonVariant, colors: typeof Colors.light, isDark: boolean) {
  switch (variant) {
    case 'secondary':
      return {
        button: {
          backgroundColor: isDark ? colors.cardElevated : colors.surface,
          borderWidth: 0,
        },
        textColor: colors.text,
      };
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: Colors.primary,
        },
        textColor: Colors.primary,
      };
    case 'ghost':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 0,
        },
        textColor: Colors.primary,
      };
    case 'apple':
      return {
        button: {
          backgroundColor: isDark ? '#FFFFFF' : '#000000',
          borderWidth: 0,
        },
        textColor: isDark ? '#000000' : '#FFFFFF',
      };
    case 'google':
      return {
        button: {
          backgroundColor: isDark ? colors.card : '#FFFFFF',
          borderWidth: 1,
          borderColor: colors.border,
        },
        textColor: colors.text,
      };
    case 'gradient':
      return {
        button: {},
        textColor: '#FFFFFF',
      };
    default: // primary
      return {
        button: {
          backgroundColor: Colors.primary,
          borderWidth: 0,
        },
        textColor: '#FFFFFF',
      };
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});

