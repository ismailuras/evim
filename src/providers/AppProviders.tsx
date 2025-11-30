/**
 * App Providers
 * TanStack Query + Toast + Theme
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast, { BaseToast, ErrorToast, InfoToast, ToastConfig } from 'react-native-toast-message';
import { View, Text, StyleSheet } from 'react-native';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Toast configuration
const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
  info: (props) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.toastContent}
      text1Style={styles.toastTitle}
      text2Style={styles.toastMessage}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    borderRadius: 12,
    borderLeftWidth: 0,
    paddingHorizontal: 16,
  },
  errorToast: {
    borderLeftColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    borderRadius: 12,
    borderLeftWidth: 0,
    paddingHorizontal: 16,
  },
  infoToast: {
    borderLeftColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.95)',
    borderRadius: 12,
    borderLeftWidth: 0,
    paddingHorizontal: 16,
  },
  toastContent: {
    paddingHorizontal: 8,
  },
  toastTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toastMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toast config={toastConfig} />
    </QueryClientProvider>
  );
}

export { queryClient };

