/**
 * Tab Layout - Bottom navigation (hidden in this app design)
 * Note: This app uses single-screen navigation without bottom tabs
 */

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === 'dark' 
            ? Colors.dark.background 
            : Colors.light.background,
        },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
