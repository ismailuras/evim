/**
 * Modal Screen - Generic modal placeholder
 */

import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';

export default function ModalScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.text} />
        </Pressable>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Modal</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Bu bir modal ekranıdır
        </Text>
      </View>
      
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: Spacing.md,
    paddingTop: 60,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.headlineLarge,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyLarge,
    textAlign: 'center',
  },
});
