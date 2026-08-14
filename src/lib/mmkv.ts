import { Platform } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const rendersOnServer = Platform.OS === 'web' && typeof window === 'undefined';

const appStorage = createMMKV({ id: 'closure.app' });

export const mmkvStateStorage: StateStorage = {
  getItem: (name) => (rendersOnServer ? null : appStorage.getString(name) ?? null),
  removeItem: (name) => {
    if (!rendersOnServer) appStorage.remove(name);
  },
  setItem: (name, value) => {
    if (!rendersOnServer) appStorage.set(name, value);
  },
};
