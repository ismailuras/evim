/**
 * AiModal Component - Bottom sheet modal for AI suggestions
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';
import { Button } from './Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = 380;

interface AiModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  tertiaryAction?: {
    label: string;
    onPress: () => void;
  };
}

export function AiModal({
  visible,
  onClose,
  title,
  message,
  icon = 'bulb',
  primaryAction,
  secondaryAction,
  tertiaryAction,
}: AiModalProps) {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(MODAL_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const context = useSharedValue({ y: 0 });

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, SpringConfigs.gentle);
      backdropOpacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withSpring(MODAL_HEIGHT, SpringConfigs.gentle);
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        onClose();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  const closeModal = useCallback(() => {
    onClose();
  }, [onClose]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(0, context.value.y + event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(MODAL_HEIGHT, SpringConfigs.gentle);
        backdropOpacity.value = withTiming(0, { duration: 200 });
        runOnJS(closeModal)();
      } else {
        translateY.value = withSpring(0, SpringConfigs.gentle);
      }
    });

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const indicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, MODAL_HEIGHT / 4],
      [1, 0.5],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  if (!visible && backdropOpacity.value === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <BlurView
            intensity={isDark ? 40 : 20}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        </Pressable>
      </Animated.View>

      {/* Modal */}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.modal,
            { backgroundColor: colors.card },
            modalStyle,
          ]}
        >
          {/* Drag indicator */}
          <Animated.View style={[styles.dragIndicator, indicatorStyle]}>
            <View style={[styles.indicator, { backgroundColor: colors.border }]} />
          </Animated.View>

          {/* AI Icon with gradient */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconGradient}
            >
              <Ionicons name={icon} size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>

          {/* Content */}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            {primaryAction && (
              <Button
                title={primaryAction.label}
                onPress={primaryAction.onPress}
                variant="primary"
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            )}
            {secondaryAction && (
              <Button
                title={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant="secondary"
                size="large"
                fullWidth
                style={styles.actionButton}
              />
            )}
            {tertiaryAction && (
              <Button
                title={tertiaryAction.label}
                onPress={tertiaryAction.onPress}
                variant="ghost"
                size="medium"
                style={styles.actionButton}
              />
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MODAL_HEIGHT,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  dragIndicator: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  indicator: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.headlineSmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    marginTop: Spacing.xs,
  },
});

