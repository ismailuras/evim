/**
 * LG TV Control Service
 * WebSocket ile WebOS TV kontrolü
 */

import { TvCommandResult, APP_IDS, StreamingApp, TvInputSource, LG_KEYS } from './types';

interface LgConnection {
  ip: string;
  ws: WebSocket | null;
  clientKey?: string;
  isConnected: boolean;
  isPaired: boolean;
  commandId: number;
  pendingCommands: Map<number, { resolve: (value: any) => void; reject: (reason?: any) => void }>;
}

// Active connections cache
const connections: Map<string, LgConnection> = new Map();

// LG WebOS handshake payload
const HANDSHAKE_PAYLOAD = {
  type: 'register',
  id: 'register_0',
  payload: {
    forcePairing: false,
    pairingType: 'PROMPT',
    'client-key': '', // Will be filled if we have a saved key
    manifest: {
      manifestVersion: 1,
      appVersion: '1.1',
      signed: {
        created: '20140509',
        appId: 'com.evim.smarttv',
        vendorId: 'com.evim',
        localizedAppNames: {
          '': 'Evim',
          'tr-TR': 'Evim',
        },
        localizedVendorNames: {
          '': 'Evim',
        },
        permissions: [
          'LAUNCH',
          'LAUNCH_WEBAPP',
          'APP_TO_APP',
          'CLOSE',
          'TEST_OPEN',
          'TEST_PROTECTED',
          'CONTROL_AUDIO',
          'CONTROL_DISPLAY',
          'CONTROL_INPUT_JOYSTICK',
          'CONTROL_INPUT_MEDIA_RECORDING',
          'CONTROL_INPUT_MEDIA_PLAYBACK',
          'CONTROL_INPUT_TV',
          'CONTROL_POWER',
          'READ_APP_STATUS',
          'READ_CURRENT_CHANNEL',
          'READ_INPUT_DEVICE_LIST',
          'READ_NETWORK_STATE',
          'READ_RUNNING_APPS',
          'READ_TV_CHANNEL_LIST',
          'WRITE_NOTIFICATION_TOAST',
          'READ_POWER_STATE',
          'READ_COUNTRY_INFO',
        ],
        serial: 'EVIM001',
      },
    },
  },
};

/**
 * LG TV'ye bağlan
 */
export async function connectToLgTv(ip: string, savedClientKey?: string): Promise<boolean> {
  const existing = connections.get(ip);
  if (existing?.isConnected && existing.ws?.readyState === WebSocket.OPEN && existing.isPaired) {
    return true;
  }

  return new Promise((resolve) => {
    try {
      const wsUrl = `ws://${ip}:3000`;
      const ws = new WebSocket(wsUrl);
      
      const conn: LgConnection = {
        ip,
        ws,
        clientKey: savedClientKey,
        isConnected: false,
        isPaired: false,
        commandId: 1,
        pendingCommands: new Map(),
      };

      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 10000);

      ws.onopen = () => {
        conn.isConnected = true;
        connections.set(ip, conn);
        
        // Send handshake
        const handshake = { ...HANDSHAKE_PAYLOAD };
        if (savedClientKey) {
          handshake.payload['client-key'] = savedClientKey;
        }
        ws.send(JSON.stringify(handshake));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'registered') {
            // Pairing successful
            conn.isPaired = true;
            if (data.payload?.['client-key']) {
              conn.clientKey = data.payload['client-key'];
              // TODO: Save client key for future use
            }
            clearTimeout(timeout);
            console.log(`✅ LG TV bağlandı: ${ip}`);
            resolve(true);
          } else if (data.type === 'response') {
            // Command response
            const pending = conn.pendingCommands.get(parseInt(data.id?.split('_')[1] || '0'));
            if (pending) {
              pending.resolve(data.payload);
              conn.pendingCommands.delete(parseInt(data.id?.split('_')[1] || '0'));
            }
          } else if (data.type === 'error') {
            console.error('LG error:', data.error);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`❌ LG bağlantı hatası: ${ip}`, error);
        resolve(false);
      };

      ws.onclose = () => {
        conn.isConnected = false;
        conn.isPaired = false;
      };
    } catch (error) {
      console.error('LG bağlantı hatası:', error);
      resolve(false);
    }
  });
}

/**
 * LG TV'ye komut gönder
 */
async function sendCommand(ip: string, uri: string, payload?: any): Promise<TvCommandResult> {
  const conn = connections.get(ip);
  
  if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN || !conn.isPaired) {
    const connected = await connectToLgTv(ip, conn?.clientKey);
    if (!connected) {
      return { success: false, message: 'TV bağlantısı kurulamadı' };
    }
  }

  const connection = connections.get(ip)!;
  const commandId = connection.commandId++;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      connection.pendingCommands.delete(commandId);
      resolve({ success: false, message: 'Komut zaman aşımı' });
    }, 5000);

    connection.pendingCommands.set(commandId, {
      resolve: (data) => {
        clearTimeout(timeout);
        resolve({ success: true, message: 'Komut gönderildi', data });
      },
      reject: () => {
        clearTimeout(timeout);
        resolve({ success: false, message: 'Komut başarısız' });
      },
    });

    const message = {
      type: 'request',
      id: `command_${commandId}`,
      uri: uri,
      payload: payload || {},
    };

    connection.ws!.send(JSON.stringify(message));
  });
}

/**
 * Güç kontrolü
 */
export async function lgPower(ip: string, state?: boolean): Promise<TvCommandResult> {
  if (state === false) {
    return sendCommand(ip, 'ssap://system/turnOff');
  }
  // LG TVs don't have a turn on command via WebSocket
  // Need Wake-on-LAN for that
  return { success: false, message: 'LG TV açmak için Wake-on-LAN kullanın' };
}

export async function lgTurnOff(ip: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://system/turnOff');
}

/**
 * Ses kontrolü
 */
export async function lgSetVolume(ip: string, level: number): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://audio/setVolume', { volume: level });
}

export async function lgGetVolume(ip: string): Promise<number | null> {
  const result = await sendCommand(ip, 'ssap://audio/getVolume');
  return result.data?.volume ?? null;
}

export async function lgVolumeUp(ip: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://audio/volumeUp');
}

export async function lgVolumeDown(ip: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://audio/volumeDown');
}

/**
 * Sessiz modu
 */
export async function lgMute(ip: string, mute?: boolean): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://audio/setMute', { mute: mute ?? true });
}

/**
 * Kanal değiştir
 */
export async function lgSetChannel(ip: string, channelId: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://tv/openChannel', { channelId });
}

export async function lgChannelUp(ip: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://tv/channelUp');
}

export async function lgChannelDown(ip: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://tv/channelDown');
}

export async function lgGetChannelList(ip: string): Promise<any[]> {
  const result = await sendCommand(ip, 'ssap://tv/getChannelList');
  return result.data?.channelList || [];
}

/**
 * Kaynak değiştir
 */
export async function lgSetInput(ip: string, inputId: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://tv/switchInput', { inputId });
}

export async function lgGetInputList(ip: string): Promise<any[]> {
  const result = await sendCommand(ip, 'ssap://tv/getExternalInputList');
  return result.data?.devices || [];
}

/**
 * Uygulama başlat
 */
export async function lgLaunchApp(ip: string, app: StreamingApp): Promise<TvCommandResult> {
  const appId = APP_IDS.lg[app];
  
  if (!appId) {
    return { success: false, message: `Uygulama desteklenmiyor: ${app}` };
  }

  return sendCommand(ip, 'ssap://system.launcher/launch', { id: appId });
}

export async function lgGetAppList(ip: string): Promise<any[]> {
  const result = await sendCommand(ip, 'ssap://com.webos.applicationManager/listApps');
  return result.data?.apps || [];
}

/**
 * Navigasyon
 */
export async function lgNavigate(ip: string, direction: string): Promise<TvCommandResult> {
  const uri = `ssap://com.webos.service.ime/sendEnterKey`;
  // LG uses pointer input for navigation
  return sendCommand(ip, uri);
}

/**
 * Bildirim göster
 */
export async function lgShowToast(ip: string, message: string): Promise<TvCommandResult> {
  return sendCommand(ip, 'ssap://system.notifications/createToast', { message });
}

/**
 * TV durumunu al
 */
export async function lgGetStatus(ip: string): Promise<{ online: boolean; power: boolean; volume?: number }> {
  const conn = connections.get(ip);
  
  if (!conn?.isConnected || !conn.isPaired) {
    const connected = await connectToLgTv(ip, conn?.clientKey);
    if (!connected) {
      return { online: false, power: false };
    }
  }

  try {
    const volume = await lgGetVolume(ip);
    return {
      online: true,
      power: true,
      volume: volume ?? undefined,
    };
  } catch {
    return { online: false, power: false };
  }
}

/**
 * Bağlantıyı kapat
 */
export function disconnectLgTv(ip: string): void {
  const conn = connections.get(ip);
  if (conn?.ws) {
    conn.ws.close();
    connections.delete(ip);
  }
}

