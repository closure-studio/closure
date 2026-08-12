import * as v from 'valibot';
import type { StateStorage } from 'zustand/middleware';

import {
  MOCK_AUTH_VALUES,
  MockAuthAdapter,
  mockActiveSession,
} from '@/features/auth/api';
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

const persistentLogin = {
  credentials: {
    email: MOCK_AUTH_VALUES.activeEmail,
    password: MOCK_AUTH_VALUES.password,
  },
  rememberSession: true,
} as const;
const PENDING_LOGIN_DELAY_MS = 10;

function readPersistedState(rawValue: string | null) {
  if (rawValue === null) throw new Error('Expected the app store to be persisted.');
  const parsedValue: unknown = JSON.parse(rawValue);
  const storageValue = v.parse(v.object({ state: persistedAppStateSchema }), parsedValue);
  return storageValue.state;
}

describe('app store', () => {
  it('persists and restores a remembered User Session and Game Account state', async () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    await store.getState().login(persistentLogin);

    const persistedState = readPersistedState(memory.read());
    expect(persistedState.auth.session).toEqual(mockActiveSession);
    expect(persistedState.games.gameAccounts).toHaveLength(initialGameAccounts.length);

    const restoredStore = createAppStore(memory.storage, new MockAuthAdapter(0));
    expect(restoredStore.getState().auth).toMatchObject({
      loginError: null,
      loginStatus: 'idle',
      rememberSession: true,
      session: mockActiveSession,
    });
    expect(restoredStore.getState().games).toEqual(persistedState.games);
  });

  it('keeps an unremembered Session and Game Accounts in memory only', async () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    await store.getState().login({ ...persistentLogin, rememberSession: false });

    expect(store.getState().auth.session).toEqual(mockActiveSession);
    expect(store.getState().games.gameAccounts).toHaveLength(initialGameAccounts.length);
    expect(readPersistedState(memory.read())).toEqual({
      auth: { session: null },
      games: { activeGameAccountId: null, gameAccounts: [] },
    });
  });

  it('records invalid login input without initializing authenticated data', async () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    await store.getState().login({
      credentials: { ...persistentLogin.credentials, password: '' },
      rememberSession: true,
    });

    expect(store.getState().auth).toMatchObject({
      loginError: { code: 'invalid-input', kind: 'business' },
      loginStatus: 'failed',
      rememberSession: false,
      session: null,
    });
    expect(store.getState().games.gameAccounts).toEqual([]);
  });

  it('does not start a second login while one is pending', async () => {
    const memory = createMemoryStorage();
    const adapter = new MockAuthAdapter(PENDING_LOGIN_DELAY_MS);
    const loginSpy = jest.spyOn(adapter, 'login');
    const store = createAppStore(memory.storage, adapter);

    const firstLogin = store.getState().login(persistentLogin);
    const secondLogin = store.getState().login(persistentLogin);
    await Promise.all([firstLogin, secondLogin]);

    expect(loginSpy).toHaveBeenCalledTimes(1);
    expect(store.getState().auth.loginStatus).toBe('succeeded');
  });

  it('clears the Session and Game Accounts on logout', async () => {
    const memory = createMemoryStorage();
    const store = createAppStore(memory.storage, new MockAuthAdapter(0));
    await store.getState().login(persistentLogin);

    store.getState().logout();

    expect(store.getState().auth).toEqual({
      loginError: null,
      loginStatus: 'idle',
      rememberSession: false,
      session: null,
    });
    expect(readPersistedState(memory.read())).toEqual({
      auth: { session: null },
      games: { activeGameAccountId: null, gameAccounts: [] },
    });
  });

  it('discards malformed persisted JSON and starts without a Session', () => {
    const memory = createMemoryStorage('{invalid-json');

    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    expect(store.getState().auth.session).toBeNull();
    expect(store.getState().games.gameAccounts).toEqual([]);
    expect(memory.read()).toBeNull();
  });

  it('discards persisted data that fails its owning schema', () => {
    const memory = createMemoryStorage(JSON.stringify({ state: { auth: {}, games: {} } }));

    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    expect(store.getState().auth.session).toBeNull();
    expect(memory.read()).toBeNull();
  });

  it('discards the legacy credentials-based persisted shape', () => {
    const memory = createMemoryStorage(JSON.stringify({
      state: {
        games: { activeGameAccountId: null, gameAccounts: [] },
        user: {
          credentials: persistentLogin.credentials,
          status: 'authenticated',
          token: 'legacy-token',
        },
      },
    }));

    const store = createAppStore(memory.storage, new MockAuthAdapter(0));

    expect(store.getState().auth.session).toBeNull();
    expect(memory.read()).toBeNull();
  });
});
