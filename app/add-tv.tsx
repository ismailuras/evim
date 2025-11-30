/**
 * AddTvScreen - Yerel ağda TV keşfi ve ekleme
 * İnternet gerekmez - Wi-Fi üzerinden otomatik bulma!
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  FadeIn,
  FadeInUp,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button, Card } from '@/components/ui';
import { 
  useTvDiscovery, 
  useSaveLocalDevice, 
  convertToTvDevice,
  useRooms,
} from '@/src/hooks/useDevices';
import { DiscoveredTv, TvBrand } from '@/src/services/tv';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Brand icons and colors
const BRAND_CONFIG: Record<TvBrand, { icon: string; color: string; name: string }> = {
  samsung: { icon: 'tv', color: '#1428A0', name: 'Samsung' },
  lg: { icon: 'tv', color: '#A50034', name: 'LG' },
  roku: { icon: 'tv', color: '#6C3C97', name: 'Roku' },
  android: { icon: 'logo-android', color: '#3DDC84', name: 'Android TV' },
  vestel: { icon: 'tv', color: '#E30613', name: 'Vestel' },
  unknown: { icon: 'tv-outline', color: Colors.primary, name: 'TV' },
};

export default function AddTvScreen() {
  const { colors, isDark } = useTheme();
  const [showManualInput, setShowManualInput] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [tvName, setTvName] = useState('');
  const [selectedTv, setSelectedTv] = useState<DiscoveredTv | null>(null);
  
  const { isDiscovering, progress, discoveredTvs, startDiscovery } = useTvDiscovery();
  const saveDevice = useSaveLocalDevice();
  const { data: rooms = [] } = useRooms();

  const scannerPulse = useSharedValue(1);

  useEffect(() => {
    // Start discovery on mount
    startDiscovery();

    // Pulse animation
    scannerPulse.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scannerPulse.value }],
  }));

  const handleBack = () => {
    router.back();
  };

  const handleSelectTv = (tv: DiscoveredTv) => {
    setSelectedTv(tv);
    setTvName(tv.name);
  };

  const handleSaveTv = async () => {
    if (!selectedTv && !ipAddress) return;

    const tvDevice = selectedTv 
      ? convertToTvDevice(selectedTv)
      : convertToTvDevice({
          ip: ipAddress,
          name: tvName || 'Yeni TV',
          brand: 'unknown',
        });

    if (tvName) {
      tvDevice.name = tvName;
    }

    try {
      await saveDevice.mutateAsync(tvDevice);
      Toast.show({
        type: 'success',
        text1: 'TV Eklendi!',
        text2: `${tvDevice.name} başarıyla kaydedildi`,
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'TV eklenirken bir sorun oluştu',
      });
    }
  };

  const handleManualConnect = async () => {
    if (!ipAddress || !tvName) return;
    
    const tvDevice = convertToTvDevice({
      ip: ipAddress,
      name: tvName,
      brand: 'unknown',
    });

    try {
      await saveDevice.mutateAsync(tvDevice);
      Toast.show({
        type: 'success',
        text1: 'TV Eklendi!',
        text2: `${tvName} başarıyla kaydedildi`,
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Hata',
        text2: 'TV eklenirken bir sorun oluştu',
      });
    }
  };

  const renderDiscoveredTv = ({ item }: { item: DiscoveredTv }) => {
    const config = BRAND_CONFIG[item.brand] || BRAND_CONFIG.unknown;
    const isSelected = selectedTv?.ip === item.ip;

    return (
      <Pressable onPress={() => handleSelectTv(item)}>
        <Card 
          style={[
            styles.tvItem, 
            isSelected && { borderColor: Colors.primary, borderWidth: 2 }
          ]}
        >
          <View style={[styles.tvIcon, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon as any} size={28} color={config.color} />
          </View>
          <View style={styles.tvInfo}>
            <Text style={[styles.tvName, { color: colors.text }]}>
              {item.name || item.friendlyName || `${config.name}`}
            </Text>
            <Text style={[styles.tvDetails, { color: colors.textSecondary }]}>
              {config.name} • {item.ip}
            </Text>
            {item.model && (
              <Text style={[styles.tvModel, { color: colors.textTertiary }]}>
                {item.model}
              </Text>
            )}
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          )}
        </Card>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <Animated.View
        entering={FadeIn.delay(100).duration(400)}
        style={styles.header}
      >
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          TV Ekle
        </Text>
        <Pressable onPress={startDiscovery} style={styles.refreshButton}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color={isDiscovering ? Colors.primary : colors.text} 
          />
        </Pressable>
      </Animated.View>

      {!showManualInput ? (
        <>
          {/* Discovery Status */}
          <Animated.View
            entering={FadeInUp.delay(200).duration(500)}
            style={styles.statusSection}
          >
            {isDiscovering ? (
              <View style={styles.discoveringContainer}>
                <Animated.View style={[styles.scannerIcon, pulseStyle]}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.accent]}
                    style={styles.scannerGradient}
                  >
                    <Ionicons name="wifi" size={32} color="#FFF" />
                  </LinearGradient>
                </Animated.View>
                <Text style={[styles.discoveringText, { color: colors.text }]}>
                  TV Aranıyor...
                </Text>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                  {progress}
                </Text>
              </View>
            ) : (
              <View style={styles.resultHeader}>
                <Text style={[styles.resultTitle, { color: colors.text }]}>
                  {discoveredTvs.length > 0 
                    ? `${discoveredTvs.length} TV Bulundu` 
                    : 'TV Bulunamadı'}
                </Text>
                <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                  {discoveredTvs.length > 0 
                    ? 'Eklemek için bir TV seçin'
                    : 'Aynı Wi-Fi ağında olduğunuzdan emin olun'}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Discovered TVs List */}
          {discoveredTvs.length > 0 && (
            <FlatList
              data={discoveredTvs}
              renderItem={renderDiscoveredTv}
              keyExtractor={(item) => item.ip}
              contentContainerStyle={styles.tvList}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Selected TV - Save Button */}
          {selectedTv && (
            <Animated.View
              entering={FadeInUp.duration(300)}
              style={styles.selectedSection}
            >
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="TV Adı (opsiyonel)"
                placeholderTextColor={colors.textTertiary}
                value={tvName}
                onChangeText={setTvName}
              />
              <Button
                title="TV'yi Kaydet"
                onPress={handleSaveTv}
                variant="primary"
                size="large"
                loading={saveDevice.isPending}
                icon={<Ionicons name="checkmark" size={20} color="#FFF" />}
              />
            </Animated.View>
          )}

          {/* Manual Input Button */}
          <Animated.View
            entering={FadeInUp.delay(500).duration(500)}
            style={styles.bottomSection}
          >
            <Button
              title="Manuel IP Gir"
              onPress={() => setShowManualInput(true)}
              variant="secondary"
              size="large"
              icon={<Ionicons name="keypad-outline" size={20} color={colors.text} />}
            />
          </Animated.View>
        </>
      ) : (
        /* Manual Input Form */
        <Animated.View
          entering={FadeIn.duration(400)}
          style={styles.manualInputContainer}
        >
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Manuel Bağlantı
            </Text>
            <Text style={[styles.formDescription, { color: colors.textSecondary }]}>
              TV'nizin IP adresini ve ismini girin
            </Text>

            {/* TV Name Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                TV Adı
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="örn: Salon TV"
                placeholderTextColor={colors.textTertiary}
                value={tvName}
                onChangeText={setTvName}
              />
            </View>

            {/* IP Address Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                IP Adresi
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="örn: 192.168.1.100"
                placeholderTextColor={colors.textTertiary}
                value={ipAddress}
                onChangeText={setIpAddress}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formButtons}>
              <Button
                title="İptal"
                onPress={() => setShowManualInput(false)}
                variant="secondary"
                size="medium"
                style={styles.formButton}
              />
              <Button
                title="Ekle"
                onPress={handleManualConnect}
                variant="primary"
                size="medium"
                style={styles.formButton}
                disabled={!ipAddress || !tvName}
                loading={saveDevice.isPending}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Help text */}
      <View style={styles.helpSection}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textTertiary} />
        <Text style={[styles.helpText, { color: colors.textTertiary }]}>
          TV ve telefon aynı Wi-Fi ağında olmalı
        </Text>
      </View>
    </KeyboardAvoidingView>
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
  refreshButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  discoveringContainer: {
    alignItems: 'center',
  },
  scannerIcon: {
    marginBottom: Spacing.md,
  },
  scannerGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveringText: {
    ...Typography.titleMedium,
    marginBottom: Spacing.xs,
  },
  progressText: {
    ...Typography.bodySmall,
  },
  resultHeader: {
    alignItems: 'center',
  },
  resultTitle: {
    ...Typography.titleMedium,
    marginBottom: Spacing.xs,
  },
  resultSubtitle: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
  tvList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tvItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tvIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tvInfo: {
    flex: 1,
  },
  tvName: {
    ...Typography.titleSmall,
    marginBottom: 2,
  },
  tvDetails: {
    ...Typography.bodySmall,
  },
  tvModel: {
    ...Typography.labelSmall,
    marginTop: 2,
  },
  selectedSection: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  nameInput: {
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyLarge,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    marginTop: 'auto',
  },
  manualInputContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
  },
  formTitle: {
    ...Typography.titleLarge,
    marginBottom: Spacing.xs,
  },
  formDescription: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelMedium,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    ...Typography.bodyLarge,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.xs,
  },
  helpText: {
    ...Typography.bodySmall,
  },
});
