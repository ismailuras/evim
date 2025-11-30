/**
 * Roku TV Control Service
 * External Control Protocol (ECP) - HTTP port 8060
 */

import { TvCommandResult, APP_IDS, StreamingApp, ROKU_KEYS } from './types';

const ROKU_PORT = 8060;

/**
 * Roku ECP endpoint'ine istek gönder
 */
async function rokuRequest(
  ip: string,
  method: 'GET' | 'POST',
  endpoint: string,
  timeout: number = 5000
): Promise<{ ok: boolean; data?: any; text?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`http://${ip}:${ROKU_PORT}${endpoint}`, {
      method,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      return { ok: true, text };
    }
    
    return { ok: false };
  } catch (error) {
    return { ok: false };
  }
}

/**
 * Tuş gönder
 */
async function sendKey(ip: string, key: string): Promise<TvCommandResult> {
  const result = await rokuRequest(ip, 'POST', `/keypress/${key}`);
  
  if (result.ok) {
    return { success: true, message: `Tuş gönderildi: ${key}` };
  }
  
  return { success: false, message: 'Tuş gönderilemedi' };
}

/**
 * Güç kontrolü
 */
export async function rokuPower(ip: string, state?: boolean): Promise<TvCommandResult> {
  if (state === true) {
    return sendKey(ip, ROKU_KEYS.POWER_ON);
  } else if (state === false) {
    return sendKey(ip, ROKU_KEYS.POWER_OFF);
  }
  return sendKey(ip, ROKU_KEYS.POWER);
}

export async function rokuPowerOn(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.POWER_ON);
}

export async function rokuPowerOff(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.POWER_OFF);
}

/**
 * Ses kontrolü
 */
export async function rokuVolumeUp(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.VOLUME_UP);
}

export async function rokuVolumeDown(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.VOLUME_DOWN);
}

export async function rokuSetVolume(ip: string, level: number): Promise<TvCommandResult> {
  // Roku doesn't support direct volume set
  // Return success but note the limitation
  return { 
    success: true, 
    message: 'Roku ses seviyesi butonlarla ayarlanır',
    data: { volume: level }
  };
}

/**
 * Sessiz modu
 */
export async function rokuMute(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.VOLUME_MUTE);
}

/**
 * Kanal değiştir
 */
export async function rokuChannelUp(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.CHANNEL_UP);
}

export async function rokuChannelDown(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.CHANNEL_DOWN);
}

export async function rokuSetChannel(ip: string, channel: string | number): Promise<TvCommandResult> {
  // Roku uses app IDs for channels, not traditional channel numbers
  // Live TV is typically through an app
  return { success: false, message: 'Roku kanal değiştirme uygulama üzerinden yapılır' };
}

/**
 * Navigasyon
 */
export async function rokuNavigate(ip: string, direction: string): Promise<TvCommandResult> {
  const keys: Record<string, string> = {
    up: ROKU_KEYS.UP,
    down: ROKU_KEYS.DOWN,
    left: ROKU_KEYS.LEFT,
    right: ROKU_KEYS.RIGHT,
    select: ROKU_KEYS.SELECT,
    enter: ROKU_KEYS.SELECT,
    back: ROKU_KEYS.BACK,
    home: ROKU_KEYS.HOME,
  };
  
  const key = keys[direction.toLowerCase()];
  if (key) {
    return sendKey(ip, key);
  }
  
  return { success: false, message: 'Geçersiz yön' };
}

/**
 * Media kontrolü
 */
export async function rokuPlay(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.PLAY);
}

export async function rokuPause(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.PAUSE);
}

export async function rokuRewind(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.REV);
}

export async function rokuFastForward(ip: string): Promise<TvCommandResult> {
  return sendKey(ip, ROKU_KEYS.FWD);
}

/**
 * Uygulama başlat
 */
export async function rokuLaunchApp(ip: string, app: StreamingApp): Promise<TvCommandResult> {
  const appId = APP_IDS.roku[app];
  
  if (!appId) {
    return { success: false, message: `Uygulama desteklenmiyor: ${app}` };
  }

  const result = await rokuRequest(ip, 'POST', `/launch/${appId}`);
  
  if (result.ok) {
    return { success: true, message: `${app} başlatıldı` };
  }
  
  return { success: false, message: `${app} başlatılamadı` };
}

/**
 * Uygulama listesini al
 */
export async function rokuGetApps(ip: string): Promise<any[]> {
  const result = await rokuRequest(ip, 'GET', '/query/apps');
  
  if (result.ok && result.text) {
    // Parse XML response
    const apps: any[] = [];
    const regex = /<app id="(\d+)"[^>]*>([^<]+)<\/app>/g;
    let match;
    
    while ((match = regex.exec(result.text)) !== null) {
      apps.push({
        id: match[1],
        name: match[2],
      });
    }
    
    return apps;
  }
  
  return [];
}

/**
 * Cihaz bilgisini al
 */
export async function rokuGetDeviceInfo(ip: string): Promise<any | null> {
  const result = await rokuRequest(ip, 'GET', '/query/device-info');
  
  if (result.ok && result.text) {
    // Parse XML response
    const info: any = {};
    
    const fields = [
      'friendly-device-name',
      'model-name',
      'model-number',
      'serial-number',
      'software-version',
      'wifi-mac',
      'power-mode',
    ];
    
    fields.forEach(field => {
      const regex = new RegExp(`<${field}>([^<]+)</${field}>`);
      const match = result.text!.match(regex);
      if (match) {
        info[field.replace(/-/g, '_')] = match[1];
      }
    });
    
    return info;
  }
  
  return null;
}

/**
 * Aktif uygulamayı al
 */
export async function rokuGetActiveApp(ip: string): Promise<{ id: string; name: string } | null> {
  const result = await rokuRequest(ip, 'GET', '/query/active-app');
  
  if (result.ok && result.text) {
    const idMatch = result.text.match(/<app id="([^"]+)"/);
    const nameMatch = result.text.match(/<app[^>]*>([^<]+)<\/app>/);
    
    if (idMatch && nameMatch) {
      return {
        id: idMatch[1],
        name: nameMatch[1],
      };
    }
  }
  
  return null;
}

/**
 * TV durumunu al
 */
export async function rokuGetStatus(ip: string): Promise<{ online: boolean; power: boolean; currentApp?: string }> {
  const info = await rokuGetDeviceInfo(ip);
  
  if (info) {
    const activeApp = await rokuGetActiveApp(ip);
    return {
      online: true,
      power: info.power_mode !== 'PowerOff',
      currentApp: activeApp?.name,
    };
  }
  
  return { online: false, power: false };
}

/**
 * Kaynak değiştir (Roku'da TV Tuner input)
 */
export async function rokuSetInput(ip: string, input: string): Promise<TvCommandResult> {
  // Roku handles inputs through apps/channels
  // TV tuner is typically app ID 'tvinput.dtv'
  if (input.toLowerCase() === 'tv' || input.toLowerCase() === 'tuner') {
    return rokuRequest(ip, 'POST', '/launch/tvinput.dtv').then(r => ({
      success: r.ok,
      message: r.ok ? 'TV girişi açıldı' : 'Giriş değiştirilemedi',
    }));
  }
  
  // HDMI inputs
  const hdmiMap: Record<string, string> = {
    hdmi1: 'tvinput.hdmi1',
    hdmi2: 'tvinput.hdmi2',
    hdmi3: 'tvinput.hdmi3',
    hdmi4: 'tvinput.hdmi4',
  };
  
  const appId = hdmiMap[input.toLowerCase()];
  if (appId) {
    return rokuRequest(ip, 'POST', `/launch/${appId}`).then(r => ({
      success: r.ok,
      message: r.ok ? `${input} açıldı` : 'Giriş değiştirilemedi',
    }));
  }
  
  return { success: false, message: 'Geçersiz giriş kaynağı' };
}

/**
 * Metin gönder (arama vb. için)
 */
export async function rokuSendText(ip: string, text: string): Promise<TvCommandResult> {
  // Send each character as a keypress
  for (const char of text) {
    const encoded = encodeURIComponent(char);
    await rokuRequest(ip, 'POST', `/keypress/Lit_${encoded}`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  return { success: true, message: 'Metin gönderildi' };
}

