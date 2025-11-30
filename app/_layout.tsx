/**
 * Root Layout - Main navigation structure for Evim app
 */

import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom themes
const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.accent,
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.accent,
  },
};

export const unstable_settings = {
  initialRouteName: 'splash',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : LightTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: colorScheme === 'dark' 
                ? Colors.dark.background 
                : Colors.light.background,
            },
          }}
        >
          {/* Splash Screen */}
          <Stack.Screen
            name="splash"
            options={{
              animation: 'fade',
            }}
          />

          {/* Onboarding Flow */}
          <Stack.Screen
            name="onboarding"
            options={{
              animation: 'fade',
              gestureEnabled: false,
            }}
          />

          {/* Auth Screen */}
          <Stack.Screen
            name="auth"
            options={{
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />

          {/* Main Tab Navigation */}
          <Stack.Screen
            name="(tabs)"
            options={{
              animation: 'fade',
              gestureEnabled: false,
            }}
          />

          {/* Add TV Screen */}
          <Stack.Screen
            name="add-tv"
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />

          {/* TV Remote Screen */}
          <Stack.Screen
            name="tv-remote"
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* Rooms & Devices Screen */}
          <Stack.Screen
            name="rooms"
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* Profile Screen */}
          <Stack.Screen
            name="profile"
            options={{
              animation: 'slide_from_right',
            }}
          />

          {/* Modal */}
          <Stack.Screen
            name="modal"
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack>

        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
