/**
 * useAuth Hook
 * Kullanıcı authentication yönetimi
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import { authApi, User } from '../lib/api';

export const authKeys = {
  user: ['user'] as const,
  isLoggedIn: ['isLoggedIn'] as const,
};

/**
 * Mevcut kullanıcıyı getir
 */
export function useUser() {
  return useQuery({
    queryKey: authKeys.user,
    queryFn: authApi.getUser,
    staleTime: 5 * 60 * 1000, // 5 dakika
    retry: false,
  });
}

/**
 * Login durumunu kontrol et
 */
export function useIsLoggedIn() {
  return useQuery({
    queryKey: authKeys.isLoggedIn,
    queryFn: authApi.isLoggedIn,
    staleTime: Infinity,
  });
}

/**
 * Login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data.user);
      queryClient.setQueryData(authKeys.isLoggedIn, true);
      Toast.show({
        type: 'success',
        text1: 'Hoş Geldiniz!',
        text2: `Merhaba ${data.user.name}`,
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Giriş Başarısız',
        text2: 'E-posta veya şifre hatalı',
      });
    },
  });
}

/**
 * Register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) =>
      authApi.register(name, email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user, data.user);
      queryClient.setQueryData(authKeys.isLoggedIn, true);
      Toast.show({
        type: 'success',
        text1: 'Kayıt Başarılı!',
        text2: `Hoş geldiniz ${data.user.name}`,
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Kayıt Başarısız',
        text2: 'Lütfen bilgilerinizi kontrol edin',
      });
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.clear();
      Toast.show({
        type: 'success',
        text1: 'Çıkış Yapıldı',
        text2: 'Görüşmek üzere!',
      });
    },
  });
}

/**
 * Unified auth hook
 */
export function useAuth() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: isLoggedIn, isLoading: authLoading } = useIsLoggedIn();
  const login = useLogin();
  const register = useRegister();
  const logout = useLogout();

  return {
    user,
    isLoggedIn: isLoggedIn ?? false,
    isLoading: userLoading || authLoading,
    login: login.mutate,
    register: register.mutate,
    logout: logout.mutate,
    isLoginPending: login.isPending,
    isRegisterPending: register.isPending,
    isLogoutPending: logout.isPending,
  };
}

