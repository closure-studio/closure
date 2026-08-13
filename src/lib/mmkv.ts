import { createMMKV } from 'react-native-mmkv';

const appStorage = createMMKV({ id: 'closure.app' });

export const mmkvStateStorage = {
  getItem: (name) => appStorage.getString(name) ?? null,
  removeItem: (name) => appStorage.remove(name),
  setItem: (name, value) => appStorage.set(name, value),
} satisfies {
  getItem: (name: string) => string | null;
  removeItem: (name: string) => unknown;
  setItem: (name: string, value: string) => unknown;
};
