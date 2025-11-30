/**
 * RoomsDevicesScreen - All rooms and devices overview
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
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { RoomChip, Card } from '@/components/ui';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Device {
  id: string;
  name: string;
  type: 'tv' | 'light' | 'ac' | 'speaker' | 'camera' | 'other';
  isOn: boolean;
  status?: string;
  room: string;
}

interface Room {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  devices: Device[];
}

const roomsData: Room[] = [
  {
    id: 'all',
    name: 'Tümü',
    icon: 'apps-outline',
    devices: [],
  },
  {
    id: '1',
    name: 'Salon',
    icon: 'tv-outline',
    devices: [
      { id: '1', name: 'Samsung TV', type: 'tv', isOn: true, status: 'TRT 1', room: 'Salon' },
      { id: '2', name: 'Ana Lamba', type: 'light', isOn: true, status: '%70', room: 'Salon' },
      { id: '3', name: 'Soundbar', type: 'speaker', isOn: false, room: 'Salon' },
    ],
  },
  {
    id: '2',
    name: 'Yatak Odası',
    icon: 'bed-outline',
    devices: [
      { id: '4', name: 'Yatak Odası TV', type: 'tv', isOn: false, room: 'Yatak Odası' },
      { id: '5', name: 'Gece Lambası', type: 'light', isOn: true, status: '%30', room: 'Yatak Odası' },
    ],
  },
  {
    id: '3',
    name: 'Mutfak',
    icon: 'restaurant-outline',
    devices: [
      { id: '6', name: 'Tavan Lambası', type: 'light', isOn: true, status: '%100', room: 'Mutfak' },
      { id: '7', name: 'Güvenlik Kamerası', type: 'camera', isOn: true, room: 'Mutfak' },
    ],
  },
  {
    id: '4',
    name: 'Çalışma Odası',
    icon: 'desktop-outline',
    devices: [
      { id: '8', name: 'Masa Lambası', type: 'light', isOn: false, room: 'Çalışma Odası' },
      { id: '9', name: 'Klima', type: 'ac', isOn: true, status: '22°C', room: 'Çalışma Odası' },
    ],
  },
];

// Flatten all devices
const allDevices = roomsData.slice(1).flatMap((room) => room.devices);
roomsData[0].devices = allDevices;

export default function RoomsDevicesScreen() {
  const { colors, isDark, shadows } = useTheme();
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentRoom = roomsData.find((r) => r.id === selectedRoom);
  const devices = currentRoom?.devices || [];

  const handleBack = () => {
    router.back();
  };

  const getDeviceIcon = (type: Device['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'tv':
        return 'tv';
      case 'light':
        return 'bulb';
      case 'ac':
        return 'snow';
      case 'speaker':
        return 'volume-high';
      case 'camera':
        return 'videocam';
      default:
        return 'hardware-chip';
    }
  };

  const toggleDevice = (device: Device) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Toggle logic here
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
          {roomsData.map((room) => (
            <RoomChip
              key={room.id}
              name={room.name}
              icon={room.icon}
              isSelected={selectedRoom === room.id}
              onPress={() => setSelectedRoom(room.id)}
              deviceCount={room.devices.length}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Devices */}
      <ScrollView
        style={styles.devicesContainer}
        contentContainerStyle={styles.devicesContent}
        showsVerticalScrollIndicator={false}
      >
        {viewMode === 'grid' ? (
          <View style={styles.devicesGrid}>
            {devices.map((device, index) => (
              <Animated.View
                key={device.id}
                entering={FadeInUp.delay(100 + index * 50).duration(400)}
                layout={Layout.springify()}
              >
                <DeviceGridCard
                  device={device}
                  colors={colors}
                  shadows={shadows}
                  onPress={() => toggleDevice(device)}
                  getIcon={getDeviceIcon}
                />
              </Animated.View>
            ))}
          </View>
        ) : (
          <View style={styles.devicesList}>
            {devices.map((device, index) => (
              <Animated.View
                key={device.id}
                entering={FadeInUp.delay(100 + index * 50).duration(400)}
                layout={Layout.springify()}
              >
                <DeviceListCard
                  device={device}
                  colors={colors}
                  shadows={shadows}
                  onPress={() => toggleDevice(device)}
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
              Yeni Cihaz Ekle
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// Device Grid Card
interface DeviceCardProps {
  device: Device;
  colors: typeof Colors.light;
  shadows: any;
  onPress: () => void;
  getIcon: (type: Device['type']) => keyof typeof Ionicons.glyphMap;
}

function DeviceGridCard({ device, colors, shadows, onPress, getIcon }: DeviceCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          styles.gridCard,
          {
            backgroundColor: device.isOn ? Colors.primary + '15' : colors.card,
          },
          shadows.small,
        ]}
      >
        <View style={styles.gridCardHeader}>
          <View
            style={[
              styles.deviceIcon,
              {
                backgroundColor: device.isOn ? Colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name={getIcon(device.type)}
              size={24}
              color={device.isOn ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor: device.isOn ? Colors.success : colors.textTertiary,
              },
            ]}
          />
        </View>
        <Text style={[styles.gridCardName, { color: colors.text }]} numberOfLines={1}>
          {device.name}
        </Text>
        <Text style={[styles.gridCardStatus, { color: colors.textSecondary }]}>
          {device.status || (device.isOn ? 'Açık' : 'Kapalı')}
        </Text>
        <Text style={[styles.gridCardRoom, { color: colors.textTertiary }]}>
          {device.room}
        </Text>
      </View>
    </Pressable>
  );
}

function DeviceListCard({ device, colors, shadows, onPress, getIcon }: DeviceCardProps) {
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.listCard, { backgroundColor: colors.card }, shadows.small]}>
        <View
          style={[
            styles.listDeviceIcon,
            {
              backgroundColor: device.isOn ? Colors.primary + '15' : colors.border,
            },
          ]}
        >
          <Ionicons
            name={getIcon(device.type)}
            size={24}
            color={device.isOn ? Colors.primary : colors.textTertiary}
          />
        </View>
        <View style={styles.listCardContent}>
          <Text style={[styles.listCardName, { color: colors.text }]}>
            {device.name}
          </Text>
          <Text style={[styles.listCardRoom, { color: colors.textSecondary }]}>
            {device.room} • {device.status || (device.isOn ? 'Açık' : 'Kapalı')}
          </Text>
        </View>
        <View
          style={[
            styles.listStatusIndicator,
            {
              backgroundColor: device.isOn ? Colors.success : colors.textTertiary,
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

