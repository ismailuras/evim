/**
 * Cloud API Client
 * Sadece kullanıcı hesabı ve cihaz senkronizasyonu için
 * TV kontrolü YEREL AĞDA yapılır!
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

// API URL - Bulut senkronizasyon için
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.evim.app/api';

console.log('☁️ [Cloud API] URL:', API_URL);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token storage key
const TOKEN_KEY = 'auth_token';

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`☁️ [API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [API] ${response.status}:`, response.config.url);
    return response;
  },
  async (error: AxiosError<{ message?: string }>) => {
    console.error('❌ [API] Error:', error.message);

    // Network error - but local control still works!
    if (!error.response) {
      // Don't show toast for network errors - local control should still work
      console.log('📴 Bulut API erişilemiyor, yerel kontrol aktif');
      return Promise.reject(error);
    }

    const message = error.response.data?.message || 'Bir hata oluştu';

    switch (error.response.status) {
      case 401:
        // Clear token and redirect to login
        await AsyncStorage.removeItem(TOKEN_KEY);
        Toast.show({
          type: 'error',
          text1: 'Oturum Süresi Doldu',
          text2: 'Lütfen tekrar giriş yapın',
        });
        break;
      case 422:
        Toast.show({
          type: 'error',
          text1: 'Doğrulama Hatası',
          text2: message,
        });
        break;
      case 500:
        Toast.show({
          type: 'error',
          text1: 'Sunucu Hatası',
          text2: 'Lütfen daha sonra tekrar deneyin',
        });
        break;
    }

    return Promise.reject(error);
  }
);

export default api;

// ============ Auth Functions ============

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  },

  register: async (name: string, email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/register', { 
      name, 
      email, 
      password,
      password_confirmation: password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem(TOKEN_KEY, response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  getUser: async () => {
    const response = await api.get<{ data: User }>('/user');
    return response.data.data;
  },

  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return !!token;
  },
};

// ============ Home/Room/Device Functions ============

export const homeApi = {
  getAll: () => api.get<{ data: Home[] }>('/homes'),
  get: (id: number) => api.get<{ data: Home }>(`/homes/${id}`),
  create: (data: { name: string; address?: string }) => 
    api.post<{ data: Home }>('/homes', data),
  update: (id: number, data: Partial<Home>) => 
    api.put<{ data: Home }>(`/homes/${id}`, data),
  delete: (id: number) => api.delete(`/homes/${id}`),
};

export const roomApi = {
  getAll: () => api.get<{ data: Room[] }>('/rooms'),
  getByHome: (homeId: number) => api.get<{ data: Room[] }>(`/homes/${homeId}/rooms`),
  get: (id: number) => api.get<{ data: Room }>(`/rooms/${id}`),
  create: (data: { name: string; icon?: string; home_id: number }) => 
    api.post<{ data: Room }>('/rooms', data),
  update: (id: number, data: Partial<Room>) => 
    api.put<{ data: Room }>(`/rooms/${id}`, data),
  delete: (id: number) => api.delete(`/rooms/${id}`),
};

export const deviceApi = {
  getAll: () => api.get<{ data: CloudDevice[] }>('/devices'),
  getByRoom: (roomId: number) => api.get<{ data: CloudDevice[] }>(`/rooms/${roomId}/devices`),
  get: (id: number) => api.get<{ data: CloudDevice }>(`/devices/${id}`),
  
  // TV'yi buluta kaydet
  create: (data: CreateDeviceData) => 
    api.post<{ data: CloudDevice }>('/devices', data),
  
  update: (id: number, data: Partial<CloudDevice>) => 
    api.put<{ data: CloudDevice }>(`/devices/${id}`, data),
  
  delete: (id: number) => api.delete(`/devices/${id}`),

  // Yerel keşfedilen TV'yi senkronize et
  sync: (data: SyncDeviceData) => 
    api.post<{ data: CloudDevice }>('/devices/sync', data),
};

// ============ Types ============

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
}

export interface Home {
  id: number;
  name: string;
  address?: string;
  rooms_count?: number;
  devices_count?: number;
  rooms?: Room[];
}

export interface Room {
  id: number;
  name: string;
  icon?: string;
  home_id: number;
  devices_count?: number;
  devices?: CloudDevice[];
}

export interface CloudDevice {
  id: number;
  name: string;
  type: 'tv' | 'light' | 'ac' | 'speaker' | 'camera' | 'other';
  brand?: string;
  model?: string;
  ip_address: string;
  mac_address?: string;
  room_id: number;
  room?: Room;
  // Sync fields
  local_id?: string;
  last_synced_at?: string;
}

export interface CreateDeviceData {
  name: string;
  type: 'tv' | 'light' | 'ac' | 'speaker' | 'camera' | 'other';
  brand?: string;
  model?: string;
  ip_address: string;
  mac_address?: string;
  room_id: number;
}

export interface SyncDeviceData {
  local_id: string;
  name: string;
  type: 'tv';
  brand: string;
  model?: string;
  ip_address: string;
  mac_address?: string;
  room_id?: number;
}

