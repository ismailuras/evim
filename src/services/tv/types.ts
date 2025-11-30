/**
 * TV Service Types - Ortak interface'ler
 * Tüm TV markaları için standart tipler
 */

export type TvBrand = 'samsung' | 'lg' | 'android' | 'roku' | 'vestel' | 'unknown';

export type TvConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

export type TvPowerState = 'on' | 'off' | 'standby' | 'unknown';

export type TvInputSource = 
  | 'HDMI1' | 'HDMI2' | 'HDMI3' | 'HDMI4'
  | 'USB' | 'AV' | 'COMPONENT'
  | 'TV' | 'MIRROR';

export type StreamingApp = 
  | 'netflix' | 'youtube' | 'disney' 
  | 'spotify' | 'prime' | 'apple_tv'
  | 'hbo' | 'hulu' | 'twitch';

export interface TvDevice {
  id: string;
  name: string;
  brand: TvBrand;
  model?: string;
  ip: string;
  mac?: string;
  port?: number;
  
  // Connection state (local)
  connectionStatus: TvConnectionStatus;
  powerState: TvPowerState;
  
  // Current state
  volume?: number;
  isMuted?: boolean;
  currentChannel?: string;
  currentInput?: TvInputSource;
  currentApp?: string;
  
  // Metadata
  roomId?: number;
  cloudId?: number; // Backend'deki ID
  lastSeen?: Date;
  capabilities?: TvCapabilities;
}

export interface TvCapabilities {
  canPower: boolean;
  canVolume: boolean;
  canMute: boolean;
  canChannel: boolean;
  canInput: boolean;
  canApps: boolean;
  canWakeOnLan: boolean;
  supportedApps?: StreamingApp[];
  supportedInputs?: TvInputSource[];
}

export interface DiscoveredTv {
  ip: string;
  mac?: string;
  name: string;
  brand: TvBrand;
  model?: string;
  port?: number;
  friendlyName?: string;
  manufacturer?: string;
}

export interface TvCommand {
  type: 'power' | 'volume' | 'mute' | 'channel' | 'input' | 'app' | 'key' | 'wake';
  value?: string | number | boolean;
}

export interface TvCommandResult {
  success: boolean;
  message?: string;
  data?: any;
}

// App ID mappings per brand
export const APP_IDS: Record<TvBrand, Partial<Record<StreamingApp, string>>> = {
  samsung: {
    netflix: 'Netflix',
    youtube: 'YouTube',
    disney: 'DisneyPlus',
    spotify: 'Spotify',
    prime: 'AmazonInstantVideo',
    apple_tv: 'AppleTV',
  },
  lg: {
    netflix: 'netflix',
    youtube: 'youtube.leanback.v4',
    disney: 'com.disney.disneyplus-prod',
    spotify: 'spotify-beehive',
    prime: 'amazon',
    apple_tv: 'com.apple.appletv',
  },
  android: {
    netflix: 'com.netflix.ninja',
    youtube: 'com.google.android.youtube.tv',
    disney: 'com.disney.disneyplus',
    spotify: 'com.spotify.tv.android',
    prime: 'com.amazon.amazonvideo.livingroom',
  },
  roku: {
    netflix: '12',
    youtube: '837',
    disney: '291097',
    spotify: '22297',
    prime: '13',
    apple_tv: '551012',
  },
  vestel: {
    netflix: 'Netflix',
    youtube: 'YouTube',
  },
  unknown: {},
};

// Samsung key codes
export const SAMSUNG_KEYS = {
  POWER: 'KEY_POWER',
  POWER_OFF: 'KEY_POWEROFF',
  VOLUME_UP: 'KEY_VOLUP',
  VOLUME_DOWN: 'KEY_VOLDOWN',
  MUTE: 'KEY_MUTE',
  CHANNEL_UP: 'KEY_CHUP',
  CHANNEL_DOWN: 'KEY_CHDOWN',
  UP: 'KEY_UP',
  DOWN: 'KEY_DOWN',
  LEFT: 'KEY_LEFT',
  RIGHT: 'KEY_RIGHT',
  ENTER: 'KEY_ENTER',
  RETURN: 'KEY_RETURN',
  EXIT: 'KEY_EXIT',
  HOME: 'KEY_HOME',
  SOURCE: 'KEY_SOURCE',
  HDMI1: 'KEY_HDMI1',
  HDMI2: 'KEY_HDMI2',
  HDMI3: 'KEY_HDMI3',
  HDMI4: 'KEY_HDMI4',
  // Number keys
  NUM_0: 'KEY_0',
  NUM_1: 'KEY_1',
  NUM_2: 'KEY_2',
  NUM_3: 'KEY_3',
  NUM_4: 'KEY_4',
  NUM_5: 'KEY_5',
  NUM_6: 'KEY_6',
  NUM_7: 'KEY_7',
  NUM_8: 'KEY_8',
  NUM_9: 'KEY_9',
};

// LG key codes
export const LG_KEYS = {
  POWER: 'power',
  POWER_OFF: 'powerOff',
  VOLUME_UP: 'volumeUp',
  VOLUME_DOWN: 'volumeDown',
  MUTE: 'mute',
  CHANNEL_UP: 'channelUp',
  CHANNEL_DOWN: 'channelDown',
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  ENTER: 'enter',
  BACK: 'back',
  EXIT: 'exit',
  HOME: 'home',
};

// Roku key codes
export const ROKU_KEYS = {
  POWER: 'Power',
  POWER_ON: 'PowerOn',
  POWER_OFF: 'PowerOff',
  VOLUME_UP: 'VolumeUp',
  VOLUME_DOWN: 'VolumeDown',
  VOLUME_MUTE: 'VolumeMute',
  CHANNEL_UP: 'ChannelUp',
  CHANNEL_DOWN: 'ChannelDown',
  UP: 'Up',
  DOWN: 'Down',
  LEFT: 'Left',
  RIGHT: 'Right',
  SELECT: 'Select',
  BACK: 'Back',
  HOME: 'Home',
  PLAY: 'Play',
  PAUSE: 'Pause',
  REV: 'Rev',
  FWD: 'Fwd',
};

