/**
 * TV Services - Unified Export
 * Tüm TV kontrol servislerini tek noktadan export
 */

// Types
export * from './types';

// Discovery
export { 
  discoverTvs, 
  checkTvOnline, 
  detectTvBrand 
} from './discover';

// Wake-on-LAN
export { 
  sendWakeOnLan, 
  wakeTv,
  wakeSamsungTv,
  wakeLgTv,
  wakeRokuTv,
} from './wakeOnLan';

// Samsung
export {
  connectToSamsungTv,
  samsungPower,
  samsungSetVolume,
  samsungVolumeUp,
  samsungVolumeDown,
  samsungMute,
  samsungSetChannel,
  samsungChannelUp,
  samsungChannelDown,
  samsungSetInput,
  samsungLaunchApp,
  samsungNavigate,
  samsungGetStatus,
  disconnectSamsungTv,
} from './samsung';

// LG
export {
  connectToLgTv,
  lgPower,
  lgTurnOff,
  lgSetVolume,
  lgGetVolume,
  lgVolumeUp,
  lgVolumeDown,
  lgMute,
  lgSetChannel,
  lgChannelUp,
  lgChannelDown,
  lgGetChannelList,
  lgSetInput,
  lgGetInputList,
  lgLaunchApp,
  lgGetAppList,
  lgNavigate,
  lgShowToast,
  lgGetStatus,
  disconnectLgTv,
} from './lg';

// Roku
export {
  rokuPower,
  rokuPowerOn,
  rokuPowerOff,
  rokuVolumeUp,
  rokuVolumeDown,
  rokuSetVolume,
  rokuMute,
  rokuChannelUp,
  rokuChannelDown,
  rokuSetChannel,
  rokuNavigate,
  rokuPlay,
  rokuPause,
  rokuRewind,
  rokuFastForward,
  rokuLaunchApp,
  rokuGetApps,
  rokuGetDeviceInfo,
  rokuGetActiveApp,
  rokuGetStatus,
  rokuSetInput,
  rokuSendText,
} from './roku';

// Android TV
export {
  androidPower,
  androidSetVolume,
  androidVolumeUp,
  androidVolumeDown,
  androidMute,
  androidLaunchApp,
  androidNavigate,
  androidSetInput,
  androidSetChannel,
  androidGetStatus,
  androidGetDeviceInfo,
  androidGetApps,
  androidPlay,
  androidPause,
  androidSendText,
} from './android';

// ============ Unified Control Functions ============

import { TvBrand, TvCommandResult, StreamingApp, TvInputSource } from './types';
import * as samsung from './samsung';
import * as lg from './lg';
import * as roku from './roku';
import * as android from './android';
import { wakeTv } from './wakeOnLan';

/**
 * Unified power control
 */
export async function tvPower(
  ip: string, 
  brand: TvBrand, 
  state?: boolean,
  mac?: string
): Promise<TvCommandResult> {
  // If turning on, try wake first
  if (state === true && mac) {
    await wakeTv(ip, mac, brand);
  }

  switch (brand) {
    case 'samsung':
      return samsung.samsungPower(ip, state);
    case 'lg':
      return lg.lgPower(ip, state);
    case 'roku':
      return roku.rokuPower(ip, state);
    case 'android':
      return android.androidPower(ip, state);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified volume control
 */
export async function tvSetVolume(
  ip: string, 
  brand: TvBrand, 
  level: number
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungSetVolume(ip, level);
    case 'lg':
      return lg.lgSetVolume(ip, level);
    case 'roku':
      return roku.rokuSetVolume(ip, level);
    case 'android':
      return android.androidSetVolume(ip, level);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified mute control
 */
export async function tvMute(
  ip: string, 
  brand: TvBrand, 
  mute?: boolean
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungMute(ip);
    case 'lg':
      return lg.lgMute(ip, mute);
    case 'roku':
      return roku.rokuMute(ip);
    case 'android':
      return android.androidMute(ip, mute);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified channel control
 */
export async function tvSetChannel(
  ip: string, 
  brand: TvBrand, 
  channel: string | number
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungSetChannel(ip, channel);
    case 'lg':
      return lg.lgSetChannel(ip, String(channel));
    case 'roku':
      return roku.rokuSetChannel(ip, channel);
    case 'android':
      return android.androidSetChannel(ip, channel);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified input control
 */
export async function tvSetInput(
  ip: string, 
  brand: TvBrand, 
  input: TvInputSource
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungSetInput(ip, input);
    case 'lg':
      return lg.lgSetInput(ip, input);
    case 'roku':
      return roku.rokuSetInput(ip, input);
    case 'android':
      return android.androidSetInput(ip, input);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified app launch
 */
export async function tvLaunchApp(
  ip: string, 
  brand: TvBrand, 
  app: StreamingApp
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungLaunchApp(ip, app);
    case 'lg':
      return lg.lgLaunchApp(ip, app);
    case 'roku':
      return roku.rokuLaunchApp(ip, app);
    case 'android':
      return android.androidLaunchApp(ip, app);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified navigation
 */
export async function tvNavigate(
  ip: string, 
  brand: TvBrand, 
  direction: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'home'
): Promise<TvCommandResult> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungNavigate(ip, direction);
    case 'lg':
      return lg.lgNavigate(ip, direction);
    case 'roku':
      return roku.rokuNavigate(ip, direction);
    case 'android':
      return android.androidNavigate(ip, direction);
    default:
      return { success: false, message: 'Bilinmeyen TV markası' };
  }
}

/**
 * Unified status check
 */
export async function tvGetStatus(
  ip: string, 
  brand: TvBrand
): Promise<{ online: boolean; power: boolean; volume?: number; currentApp?: string }> {
  switch (brand) {
    case 'samsung':
      return samsung.samsungGetStatus(ip);
    case 'lg':
      return lg.lgGetStatus(ip);
    case 'roku':
      return roku.rokuGetStatus(ip);
    case 'android':
      return android.androidGetStatus(ip);
    default:
      return { online: false, power: false };
  }
}

