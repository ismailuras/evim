/**
 * useTheme Hook - Provides theme colors and utilities
 */

import { useColorScheme } from './use-color-scheme';
import { Colors, Shadows, type ColorScheme, type ThemeColors } from '@/constants/Colors';

interface UseThemeReturn {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  shadows: typeof Shadows.light;
  isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const shadows = Shadows[colorScheme];
  const isDark = colorScheme === 'dark';

  return {
    colorScheme,
    colors,
    shadows,
    isDark,
  };
}

export function useThemeColor(
  colorName: keyof ThemeColors,
  props?: { light?: string; dark?: string }
): string {
  const colorScheme = useColorScheme() ?? 'light';
  const colorFromProps = props?.[colorScheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[colorScheme][colorName];
}

