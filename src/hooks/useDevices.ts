/**
 * useDevices Hook
 * Yerel + Bulut cihaz yönetimi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { homeApi, roomApi, deviceApi, CloudDevice, Room, Home, CreateDeviceData } from '../lib/api';
import { 
  discoverTvs, 
  checkTvOnline, 
  TvDevice, 
  DiscoveredTv, 
  TvBrand,
  tvGetStatus,
} from '../services/tv';

// Storage keys
const LOCAL_DEVICES_KEY = 'local_devices';

// Query keys
export const deviceKeys = {
  homes: ['homes'] as const,
  rooms: ['rooms'] as const,
  cloudDevices: ['cloudDevices'] as const,
  localDevices: ['localDevices'] as const,
  discoveredTvs: ['discoveredTvs'] as const,
};

// ============ Local Devices ============

/**
 * Yerel kayıtlı cihazları getir
 */
export function useLocalDevices() {
  return useQuery({
    queryKey: deviceKeys.localDevices,
    queryFn: async (): Promise<TvDevice[]> => {
      const stored = await AsyncStorage.getItem(LOCAL_DEVICES_KEY);
      return stored ? JSON.parse(stored) : [];
    },
    staleTime: Infinity, // Local data doesn't stale
  });
}

/**
 * Yerel cihaz kaydet
 */
export function useSaveLocalDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (device: TvDevice) => {
      const stored = await AsyncStorage.getItem(LOCAL_DEVICES_KEY);
      const devices: TvDevice[] = stored ? JSON.parse(stored) : [];
      
      // Update or add
      const index = devices.findIndex(d => d.id === device.id);
      if (index >= 0) {
        devices[index] = device;
      } else {
        devices.push(device);
      }
      
      await AsyncStorage.setItem(LOCAL_DEVICES_KEY, JSON.stringify(devices));
      return device;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.localDevices });
    },
  });
}

/**
 * Yerel cihaz sil
 */
export function useDeleteLocalDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string) => {
      const stored = await AsyncStorage.getItem(LOCAL_DEVICES_KEY);
      const devices: TvDevice[] = stored ? JSON.parse(stored) : [];
      const filtered = devices.filter(d => d.id !== deviceId);
      await AsyncStorage.setItem(LOCAL_DEVICES_KEY, JSON.stringify(filtered));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.localDevices });
    },
  });
}

// ============ TV Discovery ============

/**
 * TV keşfi hook'u
 */
export function useTvDiscovery() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [progress, setProgress] = useState('');
  const [discoveredTvs, setDiscoveredTvs] = useState<DiscoveredTv[]>([]);

  const startDiscovery = useCallback(async () => {
    setIsDiscovering(true);
    setDiscoveredTvs([]);
    setProgress('Başlatılıyor...');

    try {
      const tvs = await discoverTvs(
        (msg) => setProgress(msg),
        (tv) => {
          setDiscoveredTvs(prev => {
            if (prev.find(p => p.ip === tv.ip)) return prev;
            return [...prev, tv];
          });
        }
      );
      
      setDiscoveredTvs(tvs);
      
      if (tvs.length > 0) {
        Toast.show({
          type: 'success',
          text1: `${tvs.length} TV Bulundu!`,
          text2: 'Eklemek için bir TV seçin',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'TV Bulunamadı',
          text2: 'Aynı Wi-Fi ağında olduğunuzdan emin olun',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Keşif Hatası',
        text2: 'TV araması başarısız oldu',
      });
    } finally {
      setIsDiscovering(false);
      setProgress('');
    }
  }, []);

  return {
    isDiscovering,
    progress,
    discoveredTvs,
    startDiscovery,
    clearDiscovery: () => setDiscoveredTvs([]),
  };
}

/**
 * Discovered TV'yi local device'a çevir
 */
export function convertToTvDevice(discovered: DiscoveredTv, roomId?: number): TvDevice {
  return {
    id: `tv_${discovered.ip.replace(/\./g, '_')}_${Date.now()}`,
    name: discovered.name || `${discovered.brand} TV`,
    brand: discovered.brand,
    model: discovered.model,
    ip: discovered.ip,
    mac: discovered.mac,
    port: discovered.port,
    connectionStatus: 'offline',
    powerState: 'unknown',
    roomId,
    capabilities: {
      canPower: true,
      canVolume: true,
      canMute: true,
      canChannel: discovered.brand !== 'roku',
      canInput: true,
      canApps: true,
      canWakeOnLan: !!discovered.mac,
    },
  };
}

// ============ Cloud Sync ============

/**
 * Evleri getir
 */
export function useHomes() {
  return useQuery({
    queryKey: deviceKeys.homes,
    queryFn: async () => {
      const response = await homeApi.getAll();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Odaları getir
 */
export function useRooms() {
  return useQuery({
    queryKey: deviceKeys.rooms,
    queryFn: async () => {
      const response = await roomApi.getAll();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Bulut cihazları getir
 */
export function useCloudDevices() {
  return useQuery({
    queryKey: deviceKeys.cloudDevices,
    queryFn: async () => {
      const response = await deviceApi.getAll();
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Cihazı buluta kaydet
 */
export function useSaveToCloud() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDeviceData) => deviceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.cloudDevices });
      Toast.show({
        type: 'success',
        text1: 'Cihaz Kaydedildi',
        text2: 'Buluta senkronize edildi',
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Kayıt Hatası',
        text2: 'Cihaz buluta kaydedilemedi',
      });
    },
  });
}

// ============ Combined Devices ============

/**
 * Tüm cihazları birleştir (yerel + bulut)
 */
export function useAllDevices() {
  const { data: localDevices = [], isLoading: localLoading } = useLocalDevices();
  const { data: cloudDevices = [], isLoading: cloudLoading } = useCloudDevices();
  const { data: rooms = [] } = useRooms();

  const [devicesWithStatus, setDevicesWithStatus] = useState<TvDevice[]>([]);

  // Merge local and cloud devices
  useEffect(() => {
    const merged: TvDevice[] = [...localDevices];
    
    // Add cloud devices that aren't in local
    cloudDevices.forEach(cloud => {
      const existing = merged.find(m => 
        m.ip === cloud.ip_address || m.cloudId === cloud.id
      );
      
      if (!existing) {
        merged.push({
          id: `cloud_${cloud.id}`,
          name: cloud.name,
          brand: (cloud.brand || 'unknown') as TvBrand,
          model: cloud.model,
          ip: cloud.ip_address,
          mac: cloud.mac_address,
          connectionStatus: 'offline',
          powerState: 'unknown',
          roomId: cloud.room_id,
          cloudId: cloud.id,
          capabilities: {
            canPower: true,
            canVolume: true,
            canMute: true,
            canChannel: true,
            canInput: true,
            canApps: true,
            canWakeOnLan: !!cloud.mac_address,
          },
        });
      } else {
        // Update cloudId reference
        existing.cloudId = cloud.id;
      }
    });

    setDevicesWithStatus(merged);
  }, [localDevices, cloudDevices]);

  // Check online status periodically
  useEffect(() => {
    const checkStatus = async () => {
      const updated = await Promise.all(
        devicesWithStatus.map(async (device) => {
          const status = await tvGetStatus(device.ip, device.brand);
          return {
            ...device,
            connectionStatus: status.online ? 'online' : 'offline',
            powerState: status.online ? (status.power ? 'on' : 'off') : 'unknown',
            volume: status.volume,
          } as TvDevice;
        })
      );
      setDevicesWithStatus(updated);
    };

    if (devicesWithStatus.length > 0) {
      checkStatus();
      const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [devicesWithStatus.length]);

  // Get room name helper
  const getRoomName = (roomId?: number) => {
    if (!roomId) return undefined;
    return rooms.find(r => r.id === roomId)?.name;
  };

  return {
    devices: devicesWithStatus.map(d => ({
      ...d,
      roomName: getRoomName(d.roomId),
    })),
    isLoading: localLoading || cloudLoading,
    rooms,
  };
}

/**
 * Tek bir TV cihazını getir (ID ile)
 */
export function useTvDevice(deviceId: string) {
  const { devices, isLoading } = useAllDevices();
  
  const device = devices.find(d => d.id === deviceId);
  
  return {
    device,
    isLoading,
  };
}

