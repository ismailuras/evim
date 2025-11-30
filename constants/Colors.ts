/**
 * Evim - Smart Home App Color Palette
 * 2025-2026 Premium Design System
 */

export const Colors = {
  // Primary brand colors
  primary: '#0A84FF',
  accent: '#FF9F0A',
  
  // Semantic colors
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  
  light: {
    // Backgrounds
    background: '#F7F7FC',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardElevated: '#FFFFFF',
    
    // Text
    text: '#000000',
    textSecondary: '#3C3C43',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',
    
    // UI Elements
    tint: '#0A84FF',
    icon: '#3C3C43',
    iconSecondary: '#8E8E93',
    border: '#E5E5EA',
    divider: '#C6C6C8',
    
    // Tab bar
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    tabBackground: '#F7F7FC',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.4)',
    shimmer: 'rgba(255, 255, 255, 0.6)',
    
    // Gradients
    gradientStart: '#0A84FF',
    gradientEnd: '#FF9F0A',
  },
  
  dark: {
    // Backgrounds
    background: '#0A0A0A',
    surface: '#1C1C1E',
    card: '#1C1C1E',
    cardElevated: '#2C2C2E',
    
    // Text
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    textInverse: '#000000',
    
    // UI Elements
    tint: '#0A84FF',
    icon: '#EBEBF5',
    iconSecondary: '#8E8E93',
    border: '#38383A',
    divider: '#48484A',
    
    // Tab bar
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    tabBackground: '#1C1C1E',
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    shimmer: 'rgba(255, 255, 255, 0.1)',
    
    // Gradients
    gradientStart: '#0A84FF',
    gradientEnd: '#FF9F0A',
  },
};

// Spacing system (8px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Typography
export const Typography = {
  // Display
  displayLarge: {
    fontSize: 57,
    fontWeight: '700' as const,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '700' as const,
    lineHeight: 52,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '600' as const,
    lineHeight: 44,
  },
  
  // Headlines
  headlineLarge: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 40,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  
  // Titles
  titleLarge: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  
  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },
  
  // Labels
  labelLarge: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
};

// Shadows
export const Shadows = {
  light: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 5,
    },
  },
  dark: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 3,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 5,
    },
  },
};

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof Colors.light;

