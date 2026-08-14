import { createMMKV } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

const appStorage = createMMKV({ id: 'closure.app' });

export const mmkvStateStorage: StateStorage = {
  getItem: (name) => appStorage.getString(name) ?? null,
  removeItem: (name) => appStorage.remove(name),
  setItem: (name, value) => appStorage.set(name, value),
};
