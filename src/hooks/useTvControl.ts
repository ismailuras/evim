/**
 * useTvControl Hook
 * Yerel TV kontrolü - İnternet gerekmez!
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import {
  TvDevice,
  TvBrand,
  TvCommandResult,
  StreamingApp,
  TvInputSource,
  tvPower,
  tvSetVolume,
  tvMute,
  tvSetChannel,
  tvSetInput,
  tvLaunchApp,
  tvNavigate,
  tvGetStatus,
  wakeTv,
  connectToSamsungTv,
  connectToLgTv,
} from '../services/tv';

interface TvState {
  isConnected: boolean;
  isConnecting: boolean;
  powerState: 'on' | 'off' | 'unknown';
  volume: number;
  isMuted: boolean;
  currentChannel?: string;
  currentInput?: TvInputSource;
  currentApp?: string;
}

/**
 * TV kontrol hook'u
 */
export function useTvControl(device: TvDevice | null) {
  const [state, setState] = useState<TvState>({
    isConnected: false,
    isConnecting: false,
    powerState: 'unknown',
    volume: 50,
    isMuted: false,
  });

  const [isPending, setIsPending] = useState(false);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Connect to TV on mount
  useEffect(() => {
    if (!device) return;

    const connect = async () => {
      setState(s => ({ ...s, isConnecting: true }));
      
      try {
        let connected = false;
        
        if (device.brand === 'samsung') {
          connected = await connectToSamsungTv(device.ip, device.port);
        } else if (device.brand === 'lg') {
          connected = await connectToLgTv(device.ip);
        } else {
          // For other brands, just check if online
          const status = await tvGetStatus(device.ip, device.brand);
          connected = status.online;
        }

        setState(s => ({ 
          ...s, 
          isConnected: connected,
          isConnecting: false,
          powerState: connected ? 'on' : 'off',
        }));

        if (connected) {
          // Get initial status
          const status = await tvGetStatus(device.ip, device.brand);
          setState(s => ({
            ...s,
            volume: status.volume ?? 50,
            powerState: status.power ? 'on' : 'off',
          }));
        }
      } catch (error) {
        setState(s => ({ ...s, isConnected: false, isConnecting: false }));
      }
    };

    connect();

    // Periodic status check
    statusCheckInterval.current = setInterval(async () => {
      if (!device) return;
      
      const status = await tvGetStatus(device.ip, device.brand);
      setState(s => ({
        ...s,
        isConnected: status.online,
        powerState: status.online ? (status.power ? 'on' : 'off') : 'unknown',
        volume: status.volume ?? s.volume,
      }));
    }, 10000);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [device?.id]);

  // Execute command wrapper
  const executeCommand = useCallback(async (
    command: () => Promise<TvCommandResult>,
    successMessage?: string
  ): Promise<TvCommandResult> => {
    if (!device) {
      return { success: false, message: 'TV seçilmedi' };
    }

    setIsPending(true);
    
    try {
      const result = await command();
      
      if (result.success && successMessage) {
        Toast.show({
          type: 'success',
          text1: successMessage,
          visibilityTime: 1500,
        });
      } else if (!result.success) {
        Toast.show({
          type: 'error',
          text1: 'Komut Başarısız',
          text2: result.message || 'TV yanıt vermedi',
        });
      }
      
      return result;
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Bağlantı Hatası',
        text2: 'TV ile iletişim kurulamadı',
      });
      return { success: false, message: 'Bağlantı hatası' };
    } finally {
      setIsPending(false);
    }
  }, [device]);

  // ============ Control Functions ============

  const power = useCallback(async (turnOn?: boolean) => {
    if (!device) return;

    // Optimistic update
    const newState = turnOn ?? (state.powerState !== 'on');
    setState(s => ({ ...s, powerState: newState ? 'on' : 'off' }));

    const result = await executeCommand(
      () => tvPower(device.ip, device.brand, turnOn, device.mac),
      newState ? 'TV Açıldı' : 'TV Kapatıldı'
    );

    if (!result.success) {
      // Revert on failure
      setState(s => ({ ...s, powerState: state.powerState }));
    }
  }, [device, state.powerState, executeCommand]);

  const wake = useCallback(async () => {
    if (!device) return;

    Toast.show({
      type: 'info',
      text1: 'TV Uyandırılıyor...',
      text2: 'Wake-on-LAN gönderiliyor',
    });

    const success = await wakeTv(device.ip, device.mac, device.brand);

    if (success) {
      Toast.show({
        type: 'success',
        text1: 'Sinyal Gönderildi',
        text2: 'TV birkaç saniye içinde açılacak',
      });
      
      // Check status after delay
      setTimeout(async () => {
        const status = await tvGetStatus(device.ip, device.brand);
        setState(s => ({
          ...s,
          isConnected: status.online,
          powerState: status.power ? 'on' : 'off',
        }));
      }, 5000);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Uyandırma Başarısız',
        text2: 'TV MAC adresi gerekli olabilir',
      });
    }
  }, [device]);

  const setVolume = useCallback(async (level: number) => {
    if (!device) return;

    // Optimistic update
    setState(s => ({ ...s, volume: level }));

    const result = await executeCommand(
      () => tvSetVolume(device.ip, device.brand, level)
    );

    if (!result.success) {
      setState(s => ({ ...s, volume: state.volume }));
    }
  }, [device, state.volume, executeCommand]);

  const volumeUp = useCallback(async () => {
    const newVolume = Math.min(100, state.volume + 5);
    await setVolume(newVolume);
  }, [state.volume, setVolume]);

  const volumeDown = useCallback(async () => {
    const newVolume = Math.max(0, state.volume - 5);
    await setVolume(newVolume);
  }, [state.volume, setVolume]);

  const mute = useCallback(async (shouldMute?: boolean) => {
    if (!device) return;

    const newMuted = shouldMute ?? !state.isMuted;
    setState(s => ({ ...s, isMuted: newMuted }));

    const result = await executeCommand(
      () => tvMute(device.ip, device.brand, newMuted),
      newMuted ? 'Ses Kapatıldı' : 'Ses Açıldı'
    );

    if (!result.success) {
      setState(s => ({ ...s, isMuted: state.isMuted }));
    }
  }, [device, state.isMuted, executeCommand]);

  const setChannel = useCallback(async (channel: string | number) => {
    if (!device) return;

    setState(s => ({ ...s, currentChannel: String(channel) }));

    await executeCommand(
      () => tvSetChannel(device.ip, device.brand, channel),
      `Kanal: ${channel}`
    );
  }, [device, executeCommand]);

  const setInput = useCallback(async (input: TvInputSource) => {
    if (!device) return;

    setState(s => ({ ...s, currentInput: input }));

    await executeCommand(
      () => tvSetInput(device.ip, device.brand, input),
      `Kaynak: ${input}`
    );
  }, [device, executeCommand]);

  const launchApp = useCallback(async (app: StreamingApp) => {
    if (!device) return;

    const appNames: Record<StreamingApp, string> = {
      netflix: 'Netflix',
      youtube: 'YouTube',
      disney: 'Disney+',
      spotify: 'Spotify',
      prime: 'Prime Video',
      apple_tv: 'Apple TV',
      hbo: 'HBO Max',
      hulu: 'Hulu',
      twitch: 'Twitch',
    };

    setState(s => ({ ...s, currentApp: app }));

    await executeCommand(
      () => tvLaunchApp(device.ip, device.brand, app),
      `${appNames[app]} Başlatıldı`
    );
  }, [device, executeCommand]);

  const navigate = useCallback(async (
    direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'home'
  ) => {
    if (!device) return;

    await executeCommand(
      () => tvNavigate(device.ip, device.brand, direction)
    );
  }, [device, executeCommand]);

  return {
    // State
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    powerState: state.powerState,
    volume: state.volume,
    isMuted: state.isMuted,
    currentChannel: state.currentChannel,
    currentInput: state.currentInput,
    currentApp: state.currentApp,
    isPending,

    // Actions
    power,
    wake,
    setVolume,
    volumeUp,
    volumeDown,
    mute,
    setChannel,
    setInput,
    launchApp,
    navigate,

    // Helpers
    isOn: state.powerState === 'on',
    isOff: state.powerState === 'off',
    canWake: device?.capabilities?.canWakeOnLan && !!device?.mac,
  };
}

/**
 * Basitleştirilmiş TV kontrolü (sadece temel işlemler)
 */
export function useSimpleTvControl(ip: string, brand: TvBrand) {
  const [isPending, setIsPending] = useState(false);

  const execute = async (fn: () => Promise<TvCommandResult>) => {
    setIsPending(true);
    try {
      return await fn();
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    power: (state?: boolean) => execute(() => tvPower(ip, brand, state)),
    setVolume: (level: number) => execute(() => tvSetVolume(ip, brand, level)),
    mute: (state?: boolean) => execute(() => tvMute(ip, brand, state)),
    setChannel: (ch: string | number) => execute(() => tvSetChannel(ip, brand, ch)),
    setInput: (input: TvInputSource) => execute(() => tvSetInput(ip, brand, input)),
    launchApp: (app: StreamingApp) => execute(() => tvLaunchApp(ip, brand, app)),
    navigate: (dir: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'home') => 
      execute(() => tvNavigate(ip, brand, dir)),
  };
}

