/**
 * Android TV Control Service
 * HTTP/ADB benzeri komutlar + Google Cast
 */

import { TvCommandResult, APP_IDS, StreamingApp, TvInputSource } from './types';

const ANDROID_TV_PORTS = [8008, 8443, 8009];

/**
 * Android TV'ye HTTP isteği gönder
 */
async function androidRequest(
  ip: string,
  method: 'GET' | 'POST',
  endpoint: string,
  body?: any,
  timeout: number = 5000
): Promise<{ ok: boolean; data?: any }> {
  for (const port of ANDROID_TV_PORTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`http://${ip}:${port}${endpoint}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        try {
          const data = await response.json();
          return { ok: true, data };
        } catch {
          return { ok: true };
        }
      }
    } catch {
      continue;
    }
  }
  
  return { ok: false };
}

/**
 * Intent gönder (uygulama açma vb.)
 */
async function sendIntent(ip: string, intent: string): Promise<TvCommandResult> {
  // Android TV'ler genellikle ADB üzerinden intent alır
  // HTTP API sınırlı olabilir
  const result = await androidRequest(ip, 'POST', '/intent', { action: intent });
  
  return {
    success: result.ok,
    message: result.ok ? 'Intent gönderildi' : 'Intent gönderilemedi',
  };
}

/**
 * Güç kontrolü
 */
export async function androidPower(ip: string, state?: boolean): Promise<TvCommandResult> {
  // Android TV'ler genellikle Google Home veya ADB üzerinden kontrol edilir
  // HTTP API ile güç kontrolü sınırlı
  
  if (state === false) {
    return sendIntent(ip, 'android.intent.action.ACTION_SHUTDOWN');
  }
  
  // Wake için CEC veya Wake-on-LAN gerekli
  return { 
    success: false, 
    message: 'Android TV güç kontrolü için Google Home veya ADB gerekli' 
  };
}

/**
 * Ses kontrolü
 * Android TV'ler Google Cast üzerinden ses kontrolü yapabilir
 */
export async function androidSetVolume(ip: string, level: number): Promise<TvCommandResult> {
  const result = await androidRequest(ip, 'POST', '/volume', { level: level / 100 });
  
  return {
    success: result.ok,
    message: result.ok ? `Ses: ${level}` : 'Ses ayarlanamadı',
    data: { volume: level },
  };
}

export async function androidVolumeUp(ip: string): Promise<TvCommandResult> {
  return androidRequest(ip, 'POST', '/volume/up').then(r => ({
    success: r.ok,
    message: r.ok ? 'Ses artırıldı' : 'Ses artırılamadı',
  }));
}

export async function androidVolumeDown(ip: string): Promise<TvCommandResult> {
  return androidRequest(ip, 'POST', '/volume/down').then(r => ({
    success: r.ok,
    message: r.ok ? 'Ses azaltıldı' : 'Ses azaltılamadı',
  }));
}

/**
 * Sessiz modu
 */
export async function androidMute(ip: string, mute?: boolean): Promise<TvCommandResult> {
  return androidRequest(ip, 'POST', '/volume/mute', { mute: mute ?? true }).then(r => ({
    success: r.ok,
    message: r.ok ? 'Ses kapatıldı' : 'Sessiz modu değiştirilemedi',
  }));
}

/**
 * Uygulama başlat
 */
export async function androidLaunchApp(ip: string, app: StreamingApp): Promise<TvCommandResult> {
  const packageName = APP_IDS.android[app];
  
  if (!packageName) {
    return { success: false, message: `Uygulama desteklenmiyor: ${app}` };
  }

  // Intent ile uygulama başlat
  const intent = `android.intent.action.MAIN -n ${packageName}/.MainActivity`;
  const result = await sendIntent(ip, intent);
  
  if (!result.success) {
    // Alternatif: Cast ile başlat
    return androidRequest(ip, 'POST', '/launch', { appId: packageName }).then(r => ({
      success: r.ok,
      message: r.ok ? `${app} başlatıldı` : `${app} başlatılamadı`,
    }));
  }
  
  return result;
}

/**
 * Navigasyon tuşları
 * D-pad komutları gönder
 */
export async function androidNavigate(ip: string, direction: string): Promise<TvCommandResult> {
  const keyCodes: Record<string, number> = {
    up: 19,      // KEYCODE_DPAD_UP
    down: 20,    // KEYCODE_DPAD_DOWN
    left: 21,    // KEYCODE_DPAD_LEFT
    right: 22,   // KEYCODE_DPAD_RIGHT
    enter: 66,   // KEYCODE_ENTER
    select: 23,  // KEYCODE_DPAD_CENTER
    back: 4,     // KEYCODE_BACK
    home: 3,     // KEYCODE_HOME
    menu: 82,    // KEYCODE_MENU
  };
  
  const keyCode = keyCodes[direction.toLowerCase()];
  if (keyCode) {
    return androidRequest(ip, 'POST', '/input/keyevent', { keyCode }).then(r => ({
      success: r.ok,
      message: r.ok ? `${direction} gönderildi` : 'Tuş gönderilemedi',
    }));
  }
  
  return { success: false, message: 'Geçersiz tuş' };
}

/**
 * Kaynak değiştir
 */
export async function androidSetInput(ip: string, input: TvInputSource): Promise<TvCommandResult> {
  // HDMI-CEC ile kaynak değiştirme
  const hdmiPorts: Record<string, number> = {
    HDMI1: 1,
    HDMI2: 2,
    HDMI3: 3,
    HDMI4: 4,
  };
  
  const port = hdmiPorts[input];
  if (port) {
    return androidRequest(ip, 'POST', '/input/hdmi', { port }).then(r => ({
      success: r.ok,
      message: r.ok ? `${input} açıldı` : 'Kaynak değiştirilemedi',
    }));
  }
  
  return { success: false, message: 'Geçersiz kaynak' };
}

/**
 * Kanal değiştir (Live Channels uygulaması üzerinden)
 */
export async function androidSetChannel(ip: string, channel: string | number): Promise<TvCommandResult> {
  // Live Channels uygulamasına intent gönder
  const intent = `android.media.tv.action.VIEW_CHANNEL -e channel_number ${channel}`;
  return sendIntent(ip, intent);
}

/**
 * TV durumunu al
 */
export async function androidGetStatus(ip: string): Promise<{ online: boolean; power: boolean; volume?: number }> {
  const result = await androidRequest(ip, 'GET', '/status');
  
  if (result.ok) {
    return {
      online: true,
      power: result.data?.isOn ?? true,
      volume: result.data?.volume,
    };
  }
  
  // Basit ping kontrolü
  for (const port of ANDROID_TV_PORTS) {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 2000);
      
      await fetch(`http://${ip}:${port}/`, { signal: controller.signal });
      return { online: true, power: true };
    } catch {
      continue;
    }
  }
  
  return { online: false, power: false };
}

/**
 * Google Cast cihaz bilgisi
 */
export async function androidGetDeviceInfo(ip: string): Promise<any | null> {
  const result = await androidRequest(ip, 'GET', '/setup/eureka_info', undefined, 3000);
  
  if (result.ok) {
    return result.data;
  }
  
  return null;
}

/**
 * Uygulama listesi
 */
export async function androidGetApps(ip: string): Promise<any[]> {
  const result = await androidRequest(ip, 'GET', '/apps');
  return result.data?.apps || [];
}

/**
 * Media kontrolü
 */
export async function androidPlay(ip: string): Promise<TvCommandResult> {
  return androidNavigate(ip, 'play');
}

export async function androidPause(ip: string): Promise<TvCommandResult> {
  return androidRequest(ip, 'POST', '/input/keyevent', { keyCode: 127 }).then(r => ({
    success: r.ok,
    message: r.ok ? 'Duraklatıldı' : 'İşlem başarısız',
  }));
}

/**
 * Metin gönder
 */
export async function androidSendText(ip: string, text: string): Promise<TvCommandResult> {
  return androidRequest(ip, 'POST', '/input/text', { text }).then(r => ({
    success: r.ok,
    message: r.ok ? 'Metin gönderildi' : 'Metin gönderilemedi',
  }));
}

