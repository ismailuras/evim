/**
 * RoomsDevicesScreen - Odalar ve cihazlar
 * Yerel + Bulut verisi birleşik görünüm
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { RoomChip, Card } from '@/components/ui';
import { useAllDevices, useRooms } from '@/src/hooks/useDevices';
import { useTvControl } from '@/src/hooks/useTvControl';
import { TvDevice } from '@/src/services/tv';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RoomsDevicesScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get real data
  const { devices, isLoading, rooms: apiRooms } = useAllDevices();
  const { data: cloudRooms = [] } = useRooms();

  // Combine rooms
  const rooms = [
    { id: 0, name: 'Tümü', icon: 'apps-outline' as const },
    ...cloudRooms.map(r => ({ 
      id: r.id, 
      name: r.name, 
      icon: (r.icon || 'cube-outline') as keyof typeof Ionicons.glyphMap 
    })),
  ];

  // If no cloud rooms, add default ones
  if (cloudRooms.length === 0) {
    rooms.push(
      { id: 1, name: 'Salon', icon: 'tv-outline' },
      { id: 2, name: 'Yatak Odası', icon: 'bed-outline' },
      { id: 3, name: 'Mutfak', icon: 'restaurant-outline' },
    );
  }

  // Filter devices by room
  const filteredDevices = selectedRoom === 0 
    ? devices 
    : devices.filter(d => d.roomId === selectedRoom);

  const handleBack = () => {
    router.back();
  };

  const handleDevicePress = (device: TvDevice) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/tv-remote', params: { deviceId: device.id } });
  };

  const getDeviceIcon = (brand: string): keyof typeof Ionicons.glyphMap => {
    switch (brand) {
      case 'samsung':
      case 'lg':
      case 'roku':
      case 'android':
        return 'tv';
      default:
        return 'tv-outline';
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Odalar & Cihazlar
        </Text>
        <Pressable
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          style={styles.viewModeButton}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list' : 'grid'}
            size={24}
            color={colors.text}
          />
        </Pressable>
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
              deviceCount={room.id === 0 ? devices.length : devices.filter(d => d.roomId === room.id).length}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Loading State */}
      {isLoading && devices.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Cihazlar yükleniyor...
          </Text>
        </View>
      )}

      {/* Devices */}
      <ScrollView
        style={styles.devicesContainer}
        contentContainerStyle={styles.devicesContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredDevices.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Ionicons name="tv-outline" size={64} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Cihaz Bulunamadı
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {selectedRoom === 0 
                ? 'Henüz hiç cihaz eklenmemiş'
                : 'Bu odada cihaz yok'}
            </Text>
          </View>
        ) : viewMode === 'grid' ? (
          <View style={styles.devicesGrid}>
            {filteredDevices.map((device, index) => (
              <Animated.View
                key={device.id}
                entering={FadeInUp.delay(100 + index * 50).duration(400)}
                layout={Layout.springify()}
              >
                <DeviceGridCard
                  device={device}
                  colors={colors}
                  shadows={shadows}
                  onPress={() => handleDevicePress(device)}
                  getIcon={getDeviceIcon}
                />
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.devicesList}>
            {filteredDevices.map((device, index) => (
              <Animated.View
                key={device.id}
                entering={FadeInUp.delay(100 + index * 50).duration(400)}
                layout={Layout.springify()}
              >
                <DeviceListCard
                  device={device}
                  colors={colors}
                  shadows={shadows}
                  onPress={() => handleDevicePress(device)}
                  getIcon={getDeviceIcon}
                />
              </Animated.View>
            ))}
          </View>
        )}

        {/* Add Device Button */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(400)}
          style={styles.addDeviceSection}
        >
          <Pressable
            onPress={() => router.push('/add-tv')}
            style={[styles.addDeviceButton, { borderColor: colors.border }]}
          >
            <Ionicons name="add-circle-outline" size={32} color={Colors.primary} />
            <Text style={[styles.addDeviceText, { color: colors.text }]}>
              Yeni TV Ekle
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Device Grid Card
interface DeviceCardProps {
  device: TvDevice;
  colors: typeof Colors.light;
  shadows: any;
  onPress: () => void;
  getIcon: (brand: string) => keyof typeof Ionicons.glyphMap;
}

function DeviceGridCard({ device, colors, shadows, onPress, getIcon }: DeviceCardProps) {
  const isOn = device.powerState === 'on';
  const isOnline = device.connectionStatus === 'online';

  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.gridCard,
          {
            backgroundColor: isOn ? Colors.primary + '15' : colors.card,
          },
          shadows.small,
        ]}
      >
        <View style={styles.gridCardHeader}>
          <View
            style={[
              styles.deviceIcon,
              {
                backgroundColor: isOn ? Colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={getIcon(device.brand)}
              size={24}
              color={isOn ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: isOnline 
                  ? (isOn ? Colors.success : Colors.warning) 
                  : colors.textTertiary,
              },
            ]}
          />
        </View>
        <Text style={[styles.gridCardName, { color: colors.text }]} numberOfLines={1}>
          {device.name}
        </Text>
        <Text style={[styles.gridCardStatus, { color: colors.textSecondary }]}>
          {isOnline ? (isOn ? 'Açık' : 'Kapalı') : 'Çevrimdışı'}
        </Text>
        <Text style={[styles.gridCardRoom, { color: colors.textTertiary }]}>
          {device.roomName || device.brand}
        </Text>
      </View>
    </Pressable>
  );
}

function DeviceListCard({ device, colors, shadows, onPress, getIcon }: DeviceCardProps) {
  const isOn = device.powerState === 'on';
  const isOnline = device.connectionStatus === 'online';

  return (
    <Pressable onPress={onPress}>
      <View style={[styles.listCard, { backgroundColor: colors.card }, shadows.small]}>
        <View
          style={[
            styles.listDeviceIcon,
            {
              backgroundColor: isOn ? Colors.primary + '15' : colors.border,
            },
          ]}
        >
          <Ionicons
            name={getIcon(device.brand)}
            size={24}
            color={isOn ? Colors.primary : colors.textTertiary}
          />
        </View>
        <View style={styles.listCardContent}>
          <Text style={[styles.listCardName, { color: colors.text }]}>
            {device.name}
          </Text>
          <Text style={[styles.listCardRoom, { color: colors.textSecondary }]}>
            {device.roomName || device.brand} • {isOnline ? (isOn ? 'Açık' : 'Kapalı') : 'Çevrimdışı'}
          </Text>
        </View>
        <View
          style={[
            styles.listStatusIndicator,
            {
              backgroundColor: isOnline 
                ? (isOn ? Colors.success : Colors.warning) 
                : colors.textTertiary,
            },
          ]}
        />
      </View>
    </Pressable>
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
  viewModeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomSelector: {
    marginBottom: Spacing.md,
  },
  roomsContent: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.bodyMedium,
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl * 2,
  },
  emptyTitle: {
    ...Typography.titleMedium,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
  },
  devicesContainer: {
    flex: 1,
  },
  devicesContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  gridCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  gridCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  gridCardName: {
    ...Typography.titleSmall,
    marginBottom: 4,
  },
  gridCardStatus: {
    ...Typography.labelMedium,
    marginBottom: 2,
  },
  gridCardRoom: {
    ...Typography.labelSmall,
  },
  devicesList: {
    gap: Spacing.sm,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  listDeviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  listCardContent: {
    flex: 1,
  },
  listCardName: {
    ...Typography.titleSmall,
    marginBottom: 2,
  },
  listCardRoom: {
    ...Typography.bodySmall,
  },
  listStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addDeviceSection: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  addDeviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  addDeviceText: {
    ...Typography.labelLarge,
  },
});
