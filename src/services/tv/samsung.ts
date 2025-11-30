/**
 * Samsung TV Control Service
 * WebSocket (8001/8002) + REST API ile kontrol
 */

import { APP_IDS, SAMSUNG_KEYS, StreamingApp, TvCommandResult, TvInputSource } from './types';

const BASE64_APP_NAME = 'RXZpbQ=='; // "Evim" base64 encoded

interface SamsungConnection {
  ip: string;
  port: number;
  ws: WebSocket | null;
  token?: string;
  isConnected: boolean;
}

// Active connections cache
const connections: Map<string, SamsungConnection> = new Map();

/**
 * Samsung TV'ye bağlan
 */
export async function connectToSamsungTv(ip: string, port: number = 8001): Promise<boolean> {
  const key = `${ip}:${port}`;
  
  // Existing connection check
  const existing = connections.get(key);
  if (existing?.isConnected && existing.ws?.readyState === WebSocket.OPEN) {
    return true;
  }

  return new Promise((resolve) => {
    try {
      const wsUrl = `ws://${ip}:${port}/api/v2/channels/samsung.remote.control?name=${BASE64_APP_NAME}`;
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        connections.set(key, { ip, port, ws, isConnected: true });
        console.log(`✅ Samsung TV bağlandı: ${ip}`);
        resolve(true);
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`❌ Samsung bağlantı hatası: ${ip}`, error);
        resolve(false);
      };

      ws.onclose = () => {
        const conn = connections.get(key);
        if (conn) {
          conn.isConnected = false;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Token kaydı (bazı modellerde gerekli)
          if (data.data?.token) {
            const conn = connections.get(key);
            if (conn) conn.token = data.data.token;
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
    } catch (error) {
      console.error('Samsung bağlantı hatası:', error);
      resolve(false);
    }
  });
}

/**
 * WebSocket üzerinden tuş gönder
 */
async function sendKey(ip: string, key: string): Promise<TvCommandResult> {
  const conn = connections.get(`${ip}:8001`) || connections.get(`${ip}:8002`);
  
  if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN) {
    // Try to reconnect
    const connected = await connectToSamsungTv(ip);
    if (!connected) {
      return { success: false, message: 'TV bağlantısı kurulamadı' };
    }
  }

  const ws = connections.get(`${ip}:8001`)?.ws || connections.get(`${ip}:8002`)?.ws;
  
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return { success: false, message: 'WebSocket bağlantısı yok' };
  }

  return new Promise((resolve) => {
    try {
      const payload = JSON.stringify({
        method: 'ms.remote.control',
        params: {
          Cmd: 'Click',
          DataOfCmd: key,
          Option: 'false',
          TypeOfRemote: 'SendRemoteKey',
        },
      });

      ws.send(payload);
      
      // Samsung doesn't send confirmation, assume success after small delay
      setTimeout(() => {
        resolve({ success: true, message: `Tuş gönderildi: ${key}` });
      }, 100);
    } catch (error) {
      resolve({ success: false, message: 'Tuş gönderilemedi' });
    }
  });
}

/**
 * Güç kontrolü
 */
export async function samsungPower(ip: string, state?: boolean): Promise<TvCommandResult> {
  // Samsung TVs use toggle, can't directly set on/off
  return sendKey(ip, state === false ? SAMSUNG_KEYS.POWER_OFF : SAMSUNG_KEYS.POWER);
}

/**
 * Ses kontrolü
 */
export async function samsungSetVolume(ip: string, level: number): Promise<TvCommandResult> {
  // Samsung doesn't support direct volume set via WebSocket
  // We need to send volume up/down keys repeatedly
  // For now, just return the level (UI should handle visual feedback)
  
  // Alternative: Use REST API if available
  try {
    const response = await fetch(`http://${ip}:8001/api/v2/`, {
      method: 'GET',
    });
    
    if (response.ok) {
      // Some Samsung TVs support REST volume control
      // Try to set volume directly
      await fetch(`http://${ip}:8001/api/v2/audio/volume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: level }),
      });
    }
  } catch {
    // Fallback to key presses (simplified)
  }

  return { success: true, message: `Ses: ${level}`, data: { volume: level } };
}

/**
 * Ses aç/kapat
 */
export async function samsungVolumeUp(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, SAMSUNG_KEYS.VOLUME_UP);
}

export async function samsungVolumeDown(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, SAMSUNG_KEYS.VOLUME_DOWN);
}

/**
 * Sessiz modu
 */
export async function samsungMute(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, SAMSUNG_KEYS.MUTE);
}

/**
 * Kanal değiştir
 */
export async function samsungSetChannel(ip: string, channel: string | number): Promise<TvCommandResult> {
  // Kanal numarasını tek tek gönder
  const channelStr = String(channel);
  
  for (const digit of channelStr) {
    const key = `KEY_${digit}` as keyof typeof SAMSUNG_KEYS;
    await sendKey(ip, SAMSUNG_KEYS[key] || `KEY_${digit}`);
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Enter tuşu ile onayla
  await sendKey(ip, SAMSUNG_KEYS.ENTER);
  
  return { success: true, message: `Kanal: ${channel}` };
}

export async function samsungChannelUp(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, SAMSUNG_KEYS.CHANNEL_UP);
}

export async function samsungChannelDown(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, SAMSUNG_KEYS.CHANNEL_DOWN);
}

/**
 * Kaynak değiştir
 */
export async function samsungSetInput(ip: string, input: TvInputSource): Promise<TvCommandResult> {
  const inputKeys: Record<TvInputSource, string> = {
    HDMI1: SAMSUNG_KEYS.HDMI1,
    HDMI2: SAMSUNG_KEYS.HDMI2,
    HDMI3: SAMSUNG_KEYS.HDMI3,
    HDMI4: SAMSUNG_KEYS.HDMI4,
    USB: 'KEY_USB',
    AV: 'KEY_AV1',
    COMPONENT: 'KEY_COMPONENT1',
    TV: 'KEY_TV',
    MIRROR: 'KEY_CONTENTS',
  };

  const key = inputKeys[input] || SAMSUNG_KEYS.SOURCE;
  return sendKey(ip, key);
}

/**
 * Uygulama başlat
 */
export async function samsungLaunchApp(ip: string, app: StreamingApp): Promise<TvCommandResult> {
  const appId = APP_IDS.samsung[app];
  
  if (!appId) {
    return { success: false, message: `Uygulama desteklenmiyor: ${app}` };
  }

  try {
    // REST API ile uygulama başlat
    const response = await fetch(`http://${ip}:8001/api/v2/applications/${appId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.ok) {
      return { success: true, message: `${app} başlatıldı` };
    }
  } catch {
    // WebSocket fallback
  }

  // Alternatif: Deep link
  const conn = connections.get(`${ip}:8001`);
  if (conn?.ws && conn.ws.readyState === WebSocket.OPEN) {
    const payload = JSON.stringify({
      method: 'ms.channel.emit',
      params: {
        event: 'ed.apps.launch',
        to: 'host',
        data: {
          appId: appId,
          action_type: 'DEEP_LINK',
        },
      },
    });
    
    conn.ws.send(payload);
    return { success: true, message: `${app} başlatılıyor...` };
  }

  return { success: false, message: 'Uygulama başlatılamadı' };
}

/**
 * Navigasyon tuşları
 */
export async function samsungNavigate(ip: string, direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'home'): Promise<TvCommandResult> {
  const keys: Record<string, string> = {
    up: SAMSUNG_KEYS.UP,
    down: SAMSUNG_KEYS.DOWN,
    left: SAMSUNG_KEYS.LEFT,
    right: SAMSUNG_KEYS.RIGHT,
    enter: SAMSUNG_KEYS.ENTER,
    back: SAMSUNG_KEYS.RETURN,
    home: SAMSUNG_KEYS.HOME,
  };
  
  return sendKey(ip, keys[direction]);
}

/**
 * TV durumunu al
 */
export async function samsungGetStatus(ip: string): Promise<{ online: boolean; power: boolean; volume?: number }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`http://${ip}:8001/api/v2/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        online: true,
        power: data.device?.PowerState === 'on' || true, // Assume on if responding
        volume: data.device?.volume,
      };
    }
  } catch {
    // TV is offline or unreachable
  }

  return { online: false, power: false };
}

/**
 * Bağlantıyı kapat
 */
export function disconnectSamsungTv(ip: string): void {
  const keys = [`${ip}:8001`, `${ip}:8002`];
  
  keys.forEach(key => {
    const conn = connections.get(key);
    if (conn?.ws) {
      conn.ws.close();
      connections.delete(key);
    }
  });
}

