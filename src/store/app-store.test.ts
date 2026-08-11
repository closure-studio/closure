import * as v from 'valibot';
import type { StateStorage } from 'zustand/middleware';

import { initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';
import { persistedAppStateSchema } from '@/schemas/local-state';
import { APP_STORE_STORAGE_KEY, createAppStore } from './app-store';

function createMemoryStorage(initialValue?: string) {
  const values = new Map<string, string>();
  if (initialValue !== undefined) values.set(APP_STORE_STORAGE_KEY, initialValue);

  const storage: StateStorage = {
    getItem: (name) => values.get(name) ?? null,
    removeItem: (name) => values.delete(name),
    setItem: (name, value) => values.set(name, value),
  };

  return {
    read: () => values.get(APP_STORE_STORAGE_KEY) ?? null,
    storage,
  };
}

const credentials = {
  password: 'closure-password',
  remember: true,
  username: 'doctor@rhodes.is',
};

function readPersistedState(rawValue: string | null) {
  if (rawValue === null) throw new Error('Expected the app store to be persisted.');
  const parsedValue: unknown = JSON.parse(rawValue);
  const storageValue = v.parse(v.object({ state: persistedAppStateSchema }), parsedValue);
  return storageValue.state;
}

describe('app store', () => {
  it('persists and restores User Session and Game Account state', () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage);

    store.getState().signIn(credentials);

    const persistedState = readPersistedState(memory.read());
    expect(persistedState.user).toEqual({
      credentials,
      status: 'authenticated',
      token: 'mock-session-token',
    });
    expect(persistedState.games.gameAccounts).toHaveLength(initialGameAccounts.length);

    const restoredStore = createAppStore(memory.storage);
    expect(restoredStore.getState().games).toEqual(persistedState.games);
    expect(restoredStore.getState().user).toEqual(persistedState.user);
  });

  it('clears credentials, token, and Game Accounts on sign out', () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage);
    store.getState().signIn(credentials);

    store.getState().signOut();

    expect(readPersistedState(memory.read())).toEqual({
      games: { activeGameAccountId: null, gameAccounts: [] },
      user: { credentials: null, status: 'unauthenticated', token: null },
    });
  });

  it('discards malformed persisted JSON and starts unauthenticated', () => {
    const memory = createMemoryStorage('{invalid-json');

    const store = createAppStore(memory.storage);

    expect(store.getState().user.status).toBe('unauthenticated');
    expect(store.getState().games.gameAccounts).toEqual([]);
    expect(memory.read()).toBeNull();
  });

  it('discards persisted data that fails its owning schema', () => {
    const memory = createMemoryStorage(JSON.stringify({ state: { games: {}, user: {} } }));

    const store = createAppStore(memory.storage);

    expect(store.getState().user.status).toBe('unauthenticated');
    expect(memory.read()).toBeNull();
  });
});
