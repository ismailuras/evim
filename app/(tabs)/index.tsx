/**
 * HomeScreen - Main dashboard with room selector and TV card
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
} from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button, Card, TvCard, RoomChip, AiModal } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Room {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  deviceCount: number;
}

const rooms: Room[] = [
  { id: '1', name: 'Salon', icon: 'tv-outline', deviceCount: 3 },
  { id: '2', name: 'Yatak Odası', icon: 'bed-outline', deviceCount: 2 },
  { id: '3', name: 'Mutfak', icon: 'restaurant-outline', deviceCount: 4 },
  { id: '4', name: 'Çalışma', icon: 'desktop-outline', deviceCount: 2 },
];

export default function HomeScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState('1');
  const [refreshing, setRefreshing] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleTvPress = () => {
    router.push('/tv-remote');
  };

  const handleRoutinePress = () => {
    setShowAiModal(true);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {getGreeting()}, Ahmet 👋
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>Evim</Text>
          </View>
          <View style={styles.headerRight}>
            <Button
              title=""
              onPress={() => router.push('/profile')}
              variant="secondary"
              size="small"
              icon={<Ionicons name="person-circle" size={32} color={Colors.primary} />}
              style={styles.avatarButton}
            />
          </View>
        </Animated.View>

        {/* Room Selector */}
        <Animated.View
          entering={FadeIn.delay(200).duration(500)}
          style={styles.roomSelector}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roomsContent}
          >
            {rooms.map((room) => (
              <RoomChip
                key={room.id}
                name={room.name}
                icon={room.icon}
                isSelected={selectedRoom === room.id}
                onPress={() => setSelectedRoom(room.id)}
                deviceCount={room.deviceCount}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* TV Card */}
        <Animated.View
          entering={FadeInUp.delay(300).duration(500)}
          style={styles.section}
        >
          <TvCard
            name="Samsung QLED 55"
            room="Salon"
            isOn={true}
            currentChannel="TRT 1"
            thumbnailUri="https://picsum.photos/400/225"
            onPress={handleTvPress}
            onPowerPress={() => console.log('Power toggle')}
          />
        </Animated.View>

        {/* Quick Routine Card */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.section}
        >
          <Card onPress={handleRoutinePress} elevated style={styles.routineCard}>
            <LinearGradient
              colors={[Colors.accent + '20', Colors.primary + '10']}
              style={styles.routineGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.routineContent}>
                <View style={styles.routineLeft}>
                  <View
                    style={[styles.routineIcon, { backgroundColor: Colors.accent }]}
                  >
                    <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.routineText}>
                    <Text style={[styles.routineTitle, { color: colors.text }]}>
                      Akşam Rutini
                    </Text>
                    <Text
                      style={[styles.routineSubtitle, { color: colors.textSecondary }]}
                    >
                      Işıkları kıs, TV'yi aç
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="play-circle"
                  size={40}
                  color={Colors.accent}
                />
              </View>
            </LinearGradient>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(500)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hızlı İşlemler
          </Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="add-circle-outline"
              label="TV Ekle"
              onPress={() => router.push('/add-tv')}
              colors={colors}
            />
            <QuickActionButton
              icon="grid-outline"
              label="Odalar"
              onPress={() => router.push('/rooms')}
              colors={colors}
            />
            <QuickActionButton
              icon="mic-outline"
              label="Sesli"
              onPress={() => console.log('Voice')}
              colors={colors}
            />
            <QuickActionButton
              icon="settings-outline"
              label="Ayarlar"
              onPress={() => router.push('/profile')}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* Active Devices Section */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Aktif Cihazlar
            </Text>
            <Button
              title="Tümünü Gör"
              onPress={() => router.push('/rooms')}
              variant="ghost"
              size="small"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.devicesContent}
          >
            <DeviceCard
              name="TV"
              status="TRT 1"
              icon="tv"
              isOn={true}
              colors={colors}
              shadows={shadows}
            />
            <DeviceCard
              name="Lamba"
              status="%70"
              icon="bulb"
              isOn={true}
              colors={colors}
              shadows={shadows}
            />
            <DeviceCard
              name="Klima"
              status="24°C"
              icon="snow"
              isOn={false}
              colors={colors}
              shadows={shadows}
            />
          </ScrollView>
        </Animated.View>
      </ScrollView>

      {/* AI Suggestion Modal */}
      <AiModal
        visible={showAiModal}
        onClose={() => setShowAiModal(false)}
        title="Akşam Rutini"
        message="Akşam 19:30 oldu, haberleri açayım mı? Ayrıca salon ışıklarını kısabilirim."
        icon="bulb"
        primaryAction={{
          label: 'Hemen Aç',
          onPress: () => {
            setShowAiModal(false);
            // Execute routine
          },
        }}
        secondaryAction={{
          label: '5 dk sonra',
          onPress: () => setShowAiModal(false),
        }}
        tertiaryAction={{
          label: 'Hatırlatma kur',
          onPress: () => setShowAiModal(false),
        }}
      />
    </View>
  );
}

// Quick Action Button Component
interface QuickActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  colors: typeof Colors.light;
}

function QuickActionButton({ icon, label, onPress, colors }: QuickActionButtonProps) {
  return (
    <Card onPress={onPress} style={styles.quickActionCard}>
      <View style={styles.quickActionContent}>
        <View style={[styles.quickActionIcon, { backgroundColor: Colors.primary + '15' }]}>
          <Ionicons name={icon} size={24} color={Colors.primary} />
        </View>
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>
          {label}
        </Text>
      </View>
    </Card>
  );
}

// Device Card Component
interface DeviceCardProps {
  name: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  isOn: boolean;
  colors: typeof Colors.light;
  shadows: any;
}

function DeviceCard({ name, status, icon, isOn, colors, shadows }: DeviceCardProps) {
  return (
    <View style={[styles.deviceCard, { backgroundColor: colors.card }, shadows.small]}>
      <View
        style={[
          styles.deviceIconContainer,
          { backgroundColor: isOn ? Colors.primary + '15' : colors.border },
        ]}
      >
        <Ionicons
          name={icon}
          size={24}
          color={isOn ? Colors.primary : colors.textTertiary}
        />
      </View>
      <Text style={[styles.deviceName, { color: colors.text }]}>{name}</Text>
      <Text style={[styles.deviceStatus, { color: colors.textSecondary }]}>
        {status}
      </Text>
      <View
        style={[
          styles.deviceIndicator,
          { backgroundColor: isOn ? Colors.success : colors.textTertiary },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerLeft: {},
  headerRight: {},
  greeting: {
    ...Typography.bodyMedium,
    marginBottom: 4,
  },
  title: {
    ...Typography.headlineLarge,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    padding: 0,
  },
  roomSelector: {
    marginBottom: Spacing.lg,
  },
  roomsContent: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleMedium,
  },
  routineCard: {
    padding: 0,
    overflow: 'hidden',
  },
  routineGradient: {
    padding: Spacing.md,
  },
  routineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  routineText: {},
  routineTitle: {
    ...Typography.titleSmall,
    marginBottom: 2,
  },
  routineSubtitle: {
    ...Typography.bodySmall,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  quickActionCard: {
    flex: 1,
    padding: Spacing.md,
  },
  quickActionContent: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionLabel: {
    ...Typography.labelSmall,
    textAlign: 'center',
  },
  devicesContent: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  deviceCard: {
    width: 110,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  deviceName: {
    ...Typography.labelMedium,
    marginBottom: 2,
  },
  deviceStatus: {
    ...Typography.labelSmall,
    marginBottom: Spacing.sm,
  },
  deviceIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
