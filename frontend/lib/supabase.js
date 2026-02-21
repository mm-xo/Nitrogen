import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const createSecureStorageAdapter = () => {
  let useSecureStore = Platform.OS === 'ios' || Platform.OS === 'android';

  return {
    getItem: async (key) => {
      try {
        if (useSecureStore) {
          return await SecureStore.getItemAsync(key);
        }
        return await AsyncStorage.getItem(key);
      } catch {
        useSecureStore = false;
        return await AsyncStorage.getItem(key);
      }
    },
    setItem: async (key, value) => {
      try {
        if (useSecureStore) {
          await SecureStore.setItemAsync(key, value);
          return;
        }
        await AsyncStorage.setItem(key, value);
      } catch {
        useSecureStore = false;
        await AsyncStorage.setItem(key, value);
      }
    },
    removeItem: async (key) => {
      try {
        if (useSecureStore) {
          await SecureStore.deleteItemAsync(key);
          return;
        }
        await AsyncStorage.removeItem(key);
      } catch {
        useSecureStore = false;
        await AsyncStorage.removeItem(key);
      }
    },
  };
};

const storage = createSecureStorageAdapter();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
