/**
 * ProfileScreen - User profile with subscription
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Image,
  Switch,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button, Card } from '@/components/ui';

interface SettingItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
}

const settingsData: SettingItem[] = [
  {
    id: '1',
    icon: 'notifications-outline',
    title: 'Bildirimler',
    subtitle: 'AI önerileri ve cihaz uyarıları',
    type: 'toggle',
    value: true,
  },
  {
    id: '2',
    icon: 'moon-outline',
    title: 'Karanlık Mod',
    subtitle: 'Sistem ayarını kullan',
    type: 'toggle',
    value: false,
  },
  {
    id: '3',
    icon: 'mic-outline',
    title: 'Sesli Komutlar',
    subtitle: 'Türkçe ses tanıma',
    type: 'navigate',
  },
  {
    id: '4',
    icon: 'shield-checkmark-outline',
    title: 'Gizlilik',
    subtitle: 'Veri ve güvenlik ayarları',
    type: 'navigate',
  },
  {
    id: '5',
    icon: 'help-circle-outline',
    title: 'Yardım & Destek',
    type: 'navigate',
  },
  {
    id: '6',
    icon: 'information-circle-outline',
    title: 'Hakkında',
    subtitle: 'Versiyon 1.0.0',
    type: 'navigate',
  },
];

const plusFeatures = [
  { icon: 'infinite-outline', title: 'Sınırsız cihaz' },
  { icon: 'sparkles-outline', title: 'Gelişmiş AI önerileri' },
  { icon: 'people-outline', title: 'Aile paylaşımı' },
  { icon: 'analytics-outline', title: 'Enerji raporları' },
];

export default function ProfileScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [settings, setSettings] = useState(settingsData);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, value: !item.value } : item
      )
    );
  };

  const handleSubscribe = () => {
    setIsSubscribed(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(100).duration(400)}
        style={styles.header}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.profileSection}
        >
          <View style={[styles.profileCard, { backgroundColor: colors.card }, shadows.medium]}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>AY</Text>
              </LinearGradient>
              {isSubscribed && (
                <View style={styles.plusBadge}>
                  <Ionicons name="star" size={12} color="#FFFFFF" />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                Ahmet Yılmaz
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                ahmet@email.com
              </Text>
              {isSubscribed && (
                <View style={styles.subscriptionBadge}>
                  <LinearGradient
                    colors={[Colors.accent, '#FF6B00']}
                    style={styles.subscriptionBadgeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="star" size={12} color="#FFFFFF" />
                    <Text style={styles.subscriptionBadgeText}>Evim Plus</Text>
                  </LinearGradient>
                </View>
              )}
            </View>
            <Pressable style={styles.editButton}>
              <Ionicons name="pencil" size={18} color={Colors.primary} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Subscription Card */}
        {!isSubscribed && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(500)}
            style={styles.subscriptionSection}
          >
            <LinearGradient
              colors={[Colors.accent + '20', Colors.primary + '10']}
              style={[styles.subscriptionCard, { borderColor: Colors.accent + '40' }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.subscriptionHeader}>
                <LinearGradient
                  colors={[Colors.accent, '#FF6B00']}
                  style={styles.plusIcon}
                >
                  <Ionicons name="star" size={24} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.subscriptionHeaderText}>
                  <Text style={[styles.subscriptionTitle, { color: colors.text }]}>
                    Evim Plus
                  </Text>
                  <Text style={[styles.subscriptionSubtitle, { color: colors.textSecondary }]}>
                    Premium özelliklerin kilidini aç
                  </Text>
                </View>
              </View>

              <View style={styles.featuresGrid}>
                {plusFeatures.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name={feature.icon}
                      size={20}
                      color={Colors.accent}
                    />
                    <Text style={[styles.featureText, { color: colors.text }]}>
                      {feature.title}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.pricingRow}>
                <Text style={[styles.price, { color: colors.text }]}>
                  ₺49.99
                  <Text style={[styles.priceUnit, { color: colors.textSecondary }]}>
                    {' '}/ay
                  </Text>
                </Text>
              </View>

              <Button
                title="Abone Ol"
                onPress={handleSubscribe}
                variant="gradient"
                size="large"
                fullWidth
                icon={<Ionicons name="star" size={18} color="#FFFFFF" />}
              />
            </LinearGradient>
          </Animated.View>
        )}

        {/* Settings Section */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.settingsSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Ayarlar
          </Text>
          <View style={[styles.settingsList, { backgroundColor: colors.card }, shadows.small]}>
            {settings.map((item, index) => (
              <Pressable
                key={item.id}
                style={[
                  styles.settingItem,
                  index !== settings.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => {
                  if (item.type === 'toggle') {
                    toggleSetting(item.id);
                  }
                }}
              >
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: Colors.primary + '15' },
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={Colors.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  {item.subtitle && (
                    <Text
                      style={[styles.settingSubtitle, { color: colors.textSecondary }]}
                    >
                      {item.subtitle}
                    </Text>
                  )}
                </View>
                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={() => toggleSetting(item.id)}
                    trackColor={{
                      false: colors.border,
                      true: Colors.primary + '60',
                    }}
                    thumbColor={item.value ? Colors.primary : colors.surface}
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={colors.textTertiary}
                  />
                )}
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.logoutSection}
        >
          <Button
            title="Çıkış Yap"
            onPress={() => router.replace('/auth')}
            variant="secondary"
            size="large"
            fullWidth
            icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
            textStyle={{ color: Colors.error }}
          />
        </Animated.View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: colors.textTertiary }]}>
            Evim v1.0.0 • Made with ❤️ in Turkey
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.titleLarge,
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    ...Typography.titleLarge,
    fontWeight: '700',
  },
  plusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  profileName: {
    ...Typography.titleMedium,
    marginBottom: 2,
  },
  profileEmail: {
    ...Typography.bodySmall,
  },
  subscriptionBadge: {
    marginTop: Spacing.xs,
  },
  subscriptionBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 4,
  },
  subscriptionBadgeText: {
    color: '#FFFFFF',
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  subscriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  plusIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionHeaderText: {
    marginLeft: Spacing.md,
  },
  subscriptionTitle: {
    ...Typography.titleLarge,
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    ...Typography.bodySmall,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    gap: Spacing.xs,
  },
  featureText: {
    ...Typography.labelMedium,
  },
  pricingRow: {
    marginBottom: Spacing.md,
  },
  price: {
    ...Typography.headlineMedium,
  },
  priceUnit: {
    ...Typography.bodyMedium,
  },
  settingsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  settingsList: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.bodyLarge,
    marginBottom: 2,
  },
  settingSubtitle: {
    ...Typography.bodySmall,
  },
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  appInfoText: {
    ...Typography.labelSmall,
  },
});

