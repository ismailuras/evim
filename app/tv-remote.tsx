/**
 * TvRemoteScreen - Yerel TV Kumandası
 * Gerçek komutlar - İnternet gerekmez!
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { SpringConfigs } from '@/animations';
import { useTvControl } from '@/src/hooks/useTvControl';
import { useLocalDevices } from '@/src/hooks/useDevices';
import { TvDevice, StreamingApp, TvInputSource } from '@/src/services/tv';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VOLUME_CONTROL_HEIGHT = 180;
const VOLUME_KNOB_SIZE = 56;

// Turkish channel list
const channels = [
  { id: '1', name: 'TRT 1', number: 1 },
  { id: '2', name: 'ATV', number: 2 },
  { id: '3', name: 'Show TV', number: 3 },
  { id: '4', name: 'Star TV', number: 4 },
  { id: '5', name: 'Fox TV', number: 5 },
  { id: '6', name: 'Kanal D', number: 6 },
  { id: '7', name: 'TV8', number: 7 },
  { id: '8', name: 'NTV', number: 8 },
  { id: '9', name: 'CNN Türk', number: 9 },
];

// Streaming apps
const streamingApps: { id: StreamingApp; name: string; icon: string; color: string }[] = [
  { id: 'netflix', name: 'Netflix', icon: 'play', color: '#E50914' },
  { id: 'youtube', name: 'YouTube', icon: 'logo-youtube', color: '#FF0000' },
  { id: 'disney', name: 'Disney+', icon: 'play', color: '#113CCF' },
  { id: 'spotify', name: 'Spotify', icon: 'musical-notes', color: '#1DB954' },
];

// HDMI inputs
const hdmiInputs: { id: TvInputSource; name: string }[] = [
  { id: 'HDMI1', name: 'HDMI 1' },
  { id: 'HDMI2', name: 'HDMI 2' },
  { id: 'HDMI3', name: 'HDMI 3' },
  { id: 'TV', name: 'TV' },
];

export default function TvRemoteScreen() {
  const { colors, isDark, shadows } = useTheme();
  const params = useLocalSearchParams<{ deviceId?: string }>();
  
  // Get device from local storage
  const { data: devices = [] } = useLocalDevices();
  const [selectedDevice, setSelectedDevice] = useState<TvDevice | null>(null);
  
  // Find the device
  useEffect(() => {
    if (params.deviceId) {
      const device = devices.find(d => d.id === params.deviceId);
      setSelectedDevice(device || null);
    } else if (devices.length > 0) {
      // Use first device as default
      setSelectedDevice(devices[0]);
    }
  }, [params.deviceId, devices]);

  // TV Control Hook
  const tvControl = useTvControl(selectedDevice);
  
  const volumeY = useSharedValue(0);
  const powerScale = useSharedValue(1);

  // Volume gesture
  const volumeGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newY = Math.max(
        -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
        Math.min(
          VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
          event.translationY + volumeY.value
        )
      );

      const normalizedVolume = interpolate(
        newY,
        [
          -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
          VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
        ],
        [100, 0],
        Extrapolation.CLAMP
      );

      runOnJS(handleVolumeChange)(normalizedVolume);
    })
    .onEnd(() => {
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    });

  const handleVolumeChange = useCallback((newVolume: number) => {
    tvControl.setVolume(Math.round(newVolume));
  }, [tvControl]);

  const volumeKnobStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      tvControl.volume,
      [0, 100],
      [
        VOLUME_CONTROL_HEIGHT / 2 - VOLUME_KNOB_SIZE / 2,
        -VOLUME_CONTROL_HEIGHT / 2 + VOLUME_KNOB_SIZE / 2,
      ],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  const handlePowerPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    powerScale.value = withSpring(0.9, SpringConfigs.snappy, () => {
      powerScale.value = withSpring(1, SpringConfigs.snappy);
    });
    await tvControl.power();
  };

  const handleWakePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await tvControl.wake();
  };

  const handleChannelPress = async (channel: typeof channels[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await tvControl.setChannel(channel.number);
  };

  const handleAppPress = async (app: StreamingApp) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await tvControl.launchApp(app);
  };

  const handleInputPress = async (input: TvInputSource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await tvControl.setInput(input);
  };

  const handleNavPress = async (direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'home') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await tvControl.navigate(direction);
  };

  const handleMutePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await tvControl.mute();
  };

  const handleBack = () => {
    router.back();
  };

  const powerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: powerScale.value }],
  }));

  // No device selected
  if (!selectedDevice) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Ionicons name="tv-outline" size={64} color={colors.textTertiary} />
        <Text style={[styles.noDeviceText, { color: colors.text }]}>
          TV Bulunamadı
        </Text>
        <Text style={[styles.noDeviceSubtext, { color: colors.textSecondary }]}>
          Önce bir TV eklemeniz gerekiyor
        </Text>
        <Pressable 
          style={[styles.addTvButton, { backgroundColor: Colors.primary }]}
          onPress={() => router.push('/add-tv')}
        >
          <Text style={styles.addTvButtonText}>TV Ekle</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.delay(100).duration(400)}
            style={styles.header}
          >
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color={colors.text} />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={[styles.tvName, { color: colors.text }]}>
                {selectedDevice.name}
              </Text>
              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { 
                      backgroundColor: tvControl.isConnected 
                        ? (tvControl.isOn ? Colors.success : Colors.warning)
                        : colors.textTertiary 
                    },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  {tvControl.isConnecting 
                    ? 'Bağlanıyor...' 
                    : tvControl.isConnected 
                      ? (tvControl.isOn ? 'Açık' : 'Kapalı')
                      : 'Çevrimdışı'}
                </Text>
                {tvControl.isPending && (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 8 }} />
                )}
              </View>
            </View>
            <View style={styles.headerSpacer} />
          </Animated.View>

          {/* TV Preview */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.previewContainer}
          >
            <View style={[styles.preview, shadows.medium]}>
              {tvControl.isOn ? (
                <Image
                  source={{ uri: 'https://picsum.photos/320/180' }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.previewOff, { backgroundColor: '#1a1a1a' }]}>
                  <Ionicons name="tv-outline" size={40} color={colors.textTertiary} />
                  <Text style={[styles.previewOffText, { color: colors.textTertiary }]}>
                    TV Kapalı
                  </Text>
                </View>
              )}
              {tvControl.isOn && tvControl.currentChannel && (
                <View style={styles.previewOverlay}>
                  <Text style={styles.channelName}>{tvControl.currentChannel}</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Main Controls Area */}
          <View style={styles.controlsArea}>
            {/* Left: Volume Control */}
            <Animated.View
              entering={FadeIn.delay(300).duration(500)}
              style={styles.volumeSection}
            >
              <Text style={[styles.volumeLabel, { color: colors.textSecondary }]}>
                Ses
              </Text>
              <View
                style={[
                  styles.volumeTrack,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.volumeFill,
                    {
                      height: `${tvControl.volume}%`,
                      backgroundColor: tvControl.isMuted ? colors.textTertiary : Colors.primary,
                    },
                  ]}
                />
                <GestureDetector gesture={volumeGesture}>
                  <Animated.View
                    style={[
                      styles.volumeKnob,
                      volumeKnobStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={tvControl.isMuted ? [colors.card, colors.cardElevated] : [Colors.primary, '#0066CC']}
                      style={styles.volumeKnobGradient}
                    >
                      <Text style={[styles.volumeValue, { color: tvControl.isMuted ? colors.text : '#FFF' }]}>
                        {tvControl.isMuted ? '🔇' : tvControl.volume}
                      </Text>
                    </LinearGradient>
                  </Animated.View>
                </GestureDetector>
              </View>
              <Pressable onPress={handleMutePress} style={styles.muteButton}>
                <Ionicons 
                  name={tvControl.isMuted ? "volume-mute" : "volume-high"} 
                  size={24} 
                  color={tvControl.isMuted ? Colors.error : colors.textTertiary} 
                />
              </Pressable>
            </Animated.View>

            {/* Right: Power Button */}
            <Animated.View
              entering={FadeIn.delay(400).duration(500)}
              style={styles.powerSection}
            >
              {/* Wake on LAN button (if TV is off and has MAC) */}
              {!tvControl.isConnected && tvControl.canWake && (
                <Pressable onPress={handleWakePress} style={styles.wakeButton}>
                  <Ionicons name="flash" size={20} color={Colors.warning} />
                  <Text style={[styles.wakeButtonText, { color: Colors.warning }]}>
                    Uyandır
                  </Text>
                </Pressable>
              )}

              <Animated.View style={powerAnimatedStyle}>
                <Pressable onPress={handlePowerPress}>
                  <LinearGradient
                    colors={
                      tvControl.isOn
                        ? [Colors.primary, '#0066CC']
                        : [colors.card, colors.cardElevated]
                    }
                    style={styles.powerButton}
                  >
                    <Ionicons
                      name="power"
                      size={36}
                      color={tvControl.isOn ? '#FFFFFF' : colors.textTertiary}
                    />
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            </Animated.View>
          </View>

          {/* Streaming Apps */}
          <Animated.View
            entering={FadeInUp.delay(450).duration(500)}
            style={styles.appsSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Uygulamalar
            </Text>
            <View style={styles.appsGrid}>
              {streamingApps.map((app) => (
                <Pressable
                  key={app.id}
                  onPress={() => handleAppPress(app.id)}
                  style={({ pressed }) => [
                    styles.appButton,
                    { backgroundColor: app.color, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Ionicons name={app.icon as any} size={24} color="#FFF" />
                  <Text style={styles.appButtonText}>{app.name}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* HDMI Inputs */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.inputsSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Kaynaklar
            </Text>
            <View style={styles.inputsRow}>
              {hdmiInputs.map((input) => (
                <Pressable
                  key={input.id}
                  onPress={() => handleInputPress(input.id)}
                  style={({ pressed }) => [
                    styles.inputButton,
                    { 
                      backgroundColor: tvControl.currentInput === input.id ? Colors.primary : colors.card,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[
                    styles.inputButtonText,
                    { color: tvControl.currentInput === input.id ? '#FFF' : colors.text }
                  ]}>
                    {input.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Channel Grid */}
          <Animated.View
            entering={FadeInUp.delay(550).duration(500)}
            style={styles.channelSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Kanallar
            </Text>
            <View style={styles.channelGrid}>
              {channels.map((channel) => (
                <Pressable
                  key={channel.id}
                  onPress={() => handleChannelPress(channel)}
                  style={({ pressed }) => [
                    styles.channelButton,
                    {
                      backgroundColor:
                        tvControl.currentChannel === channel.name
                          ? Colors.primary
                          : colors.card,
                      opacity: pressed ? 0.8 : 1,
                    },
                    shadows.small,
                  ]}
                >
                  <Text
                    style={[
                      styles.channelNumber,
                      {
                        color:
                          tvControl.currentChannel === channel.name
                            ? '#FFFFFF'
                            : colors.text,
                      },
                    ]}
                  >
                    {channel.number}
                  </Text>
                  <Text
                    style={[
                      styles.channelButtonName,
                      {
                        color:
                          tvControl.currentChannel === channel.name
                            ? '#FFFFFF'
                            : colors.textSecondary,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {channel.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Navigation Controls */}
          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.navSection}
          >
            <View style={styles.navControls}>
              <Pressable
                style={[styles.navButton, { backgroundColor: colors.card }]}
                onPress={() => handleNavPress('up')}
              >
                <Ionicons name="chevron-up" size={28} color={colors.text} />
              </Pressable>
              <View style={styles.navRow}>
                <Pressable
                  style={[styles.navButton, { backgroundColor: colors.card }]}
                  onPress={() => handleNavPress('left')}
                >
                  <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>
                <Pressable
                  style={[styles.navButtonCenter, { backgroundColor: Colors.primary }]}
                  onPress={() => handleNavPress('enter')}
                >
                  <Text style={styles.navButtonCenterText}>OK</Text>
                </Pressable>
                <Pressable
                  style={[styles.navButton, { backgroundColor: colors.card }]}
                  onPress={() => handleNavPress('right')}
                >
                  <Ionicons name="chevron-forward" size={28} color={colors.text} />
                </Pressable>
              </View>
              <Pressable
                style={[styles.navButton, { backgroundColor: colors.card }]}
                onPress={() => handleNavPress('down')}
              >
                <Ionicons name="chevron-down" size={28} color={colors.text} />
              </Pressable>

              {/* Back and Home buttons */}
              <View style={styles.navExtraRow}>
                <Pressable
                  style={[styles.navExtraButton, { backgroundColor: colors.card }]}
                  onPress={() => handleNavPress('back')}
                >
                  <Ionicons name="arrow-back" size={22} color={colors.text} />
                  <Text style={[styles.navExtraText, { color: colors.textSecondary }]}>Geri</Text>
                </Pressable>
                <Pressable
                  style={[styles.navExtraButton, { backgroundColor: colors.card }]}
                  onPress={() => handleNavPress('home')}
                >
                  <Ionicons name="home" size={22} color={colors.text} />
                  <Text style={[styles.navExtraText, { color: colors.textSecondary }]}>Ana Sayfa</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  noDeviceText: {
    ...Typography.titleLarge,
    marginTop: Spacing.lg,
  },
  noDeviceSubtext: {
    ...Typography.bodyMedium,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  addTvButton: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  addTvButtonText: {
    color: '#FFF',
    ...Typography.titleSmall,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 60,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  tvName: {
    ...Typography.titleMedium,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...Typography.labelSmall,
  },
  headerSpacer: {
    width: 44,
  },
  previewContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewOffText: {
    ...Typography.labelSmall,
    marginTop: Spacing.xs,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  channelName: {
    color: '#FFFFFF',
    ...Typography.labelMedium,
  },
  controlsArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  volumeSection: {
    alignItems: 'center',
  },
  volumeLabel: {
    ...Typography.labelSmall,
    marginBottom: Spacing.sm,
  },
  volumeTrack: {
    width: 8,
    height: VOLUME_CONTROL_HEIGHT,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'visible',
  },
  volumeFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 4,
  },
  volumeKnob: {
    position: 'absolute',
    left: -24,
    width: VOLUME_KNOB_SIZE,
    height: VOLUME_KNOB_SIZE,
  },
  volumeKnobGradient: {
    flex: 1,
    borderRadius: VOLUME_KNOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  volumeValue: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  muteButton: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
  powerSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  wakeButtonText: {
    ...Typography.labelSmall,
    marginLeft: Spacing.xs,
  },
  powerButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  appsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  appsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  appButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  appButtonText: {
    color: '#FFF',
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  inputsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  inputButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inputButtonText: {
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  channelSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  channelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  channelButton: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  channelNumber: {
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  channelButtonName: {
    ...Typography.labelSmall,
    marginTop: 2,
  },
  navSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  navControls: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonCenterText: {
    color: '#FFFFFF',
    ...Typography.titleSmall,
    fontWeight: '700',
  },
  navExtraRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  navExtraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  navExtraText: {
    ...Typography.labelSmall,
  },
});
