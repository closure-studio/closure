import { mockActiveSession, mockAdminSession } from '@/mocks/auth';
import type { StateStorage } from 'zustand/middleware';
import { APP_STORE_STORAGE_KEY, createAppStore } from './app-store';

function createMemoryStorage(
  initial: Readonly<Record<string, string>> = {},
): { storage: StateStorage; values: Map<string, string> } {
  const values = new Map(Object.entries(initial));
  return {
    storage: {
      getItem: (name) => values.get(name) ?? null,
      removeItem: (name) => {
        values.delete(name);
      },
      setItem: (name, value) => {
        values.set(name, value);
      },
    },
    values,
  };
}

describe('App Store client state', () => {
  it('persists the session and game account across rehydration', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });

    store.getState().setSession(mockActiveSession);
    store.getState().selectGameAccount('G16601716973');
    const rememberedStore = createAppStore({ storage });
    await rememberedStore.persist.rehydrate();
    expect(rememberedStore.getState().auth.session).toEqual(mockActiveSession);
    expect(rememberedStore.getState().activeGameAccountId).toBe('G16601716973');
  });

  it('clears the session and game account on logout while keeping the node selection', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });

    store.getState().setSession(mockActiveSession);
    store.getState().selectGameAccount('G18928069156');
    store.getState().selectApiNode('overseas');
    store.getState().logout();

    expect(store.getState().auth.session).toBeNull();
    expect(store.getState().activeGameAccountId).toBeNull();
    expect(store.getState().selectedApiNodeId).toBe('overseas');

    const rehydratedStore = createAppStore({ storage });
    await rehydratedStore.persist.rehydrate();
    expect(rehydratedStore.getState().auth.session).toBeNull();
    expect(rehydratedStore.getState().selectedApiNodeId).toBe('overseas');
  });

  it('validates the API node selection and keeps the current one otherwise', () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });
    expect(store.getState().selectedApiNodeId).toBe('domestic');

    store.getState().selectApiNode('overseas');
    expect(store.getState().selectedApiNodeId).toBe('overseas');

    store.getState().selectApiNode('mars');
    expect(store.getState().selectedApiNodeId).toBe('overseas');
  });

  it('resets the game account only when the session owner changes', () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });

    store.getState().setSession(mockActiveSession);
    store.getState().selectGameAccount('G18928069156');

    store.getState().setSession(mockActiveSession);
    expect(store.getState().activeGameAccountId).toBe('G18928069156');

    store.getState().setSession(mockAdminSession);
    expect(store.getState().activeGameAccountId).toBeNull();
    expect(store.getState().auth.session).toEqual(mockAdminSession);
  });
});

describe('Persisted store format', () => {
  const emptyState = {
    activeGameAccountId: null,
    auth: { session: null },
    selectedApiNodeId: 'domestic' as const,
  };

  it('stores client state under the single app key', () => {
    const { storage, values } = createMemoryStorage();
    const store = createAppStore({ storage });

    store.getState().setSession(mockActiveSession);

    expect([...values.keys()]).toEqual([APP_STORE_STORAGE_KEY]);
  });

  it('restores valid bare state by wrapping it in the current envelope', async () => {
    const { storage } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: JSON.stringify({
        activeGameAccountId: 'G16601716973',
        auth: { session: mockActiveSession },
        selectedApiNodeId: 'overseas',
      }),
    });

    const store = createAppStore({ storage });
    await store.persist.rehydrate();
    expect(store.getState().auth.session).toEqual(mockActiveSession);
    expect(store.getState().activeGameAccountId).toBe('G16601716973');
    expect(store.getState().selectedApiNodeId).toBe('overseas');
  });

  it('drops stored data that does not match the current shape', async () => {
    const { storage, values } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: JSON.stringify({
        auth: { session: mockActiveSession },
        games: null,
        network: { selectedApiNodeId: 'overseas' },
      }),
    });

    const store = createAppStore({ storage });
    await store.persist.rehydrate();
    expect(values.has(APP_STORE_STORAGE_KEY)).toBe(false);
    expect(store.getState()).toMatchObject(emptyState);
  });

  it('clears the app key when the stored value is malformed', () => {
    const { storage, values } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: '{invalid',
    });

    createAppStore({ storage });

    expect(values.has(APP_STORE_STORAGE_KEY)).toBe(false);
  });
});
