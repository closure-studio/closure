import { mockActiveSession } from '@/mocks/auth';
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
  it('persists an environment selected before login', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });
    store.getState().selectApiNode('overseas');
    store.getState().setNextRequestMode('mock');

    const restored = createAppStore({ storage });
    await restored.persist.rehydrate();
    expect(restored.getState()).toMatchObject({
      requestMode: 'mock',
      auth: { session: null },
      selectedApiNodeId: 'overseas',
    });
  });

  it('changes only the next-launch preference', () => {
    const store = createAppStore({ storage: createMemoryStorage().storage });
    store.getState().setSession(mockActiveSession);

    store.getState().setNextRequestMode('mock');

    expect(store.getState()).toMatchObject({
      auth: { session: mockActiveSession },
      requestMode: 'mock',
    });
  });

  it('restores the session and node selection', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });
    store.getState().setSession(mockActiveSession);

    const rememberedStore = createAppStore({ storage });
    await rememberedStore.persist.rehydrate();
    expect(rememberedStore.getState().auth.session).toEqual(mockActiveSession);
    expect(rememberedStore.getState().selectedApiNodeId).toBe('domestic');
  });

  it('clears the session on logout while keeping the environment', async () => {
    const { storage } = createMemoryStorage();
    const store = createAppStore({ storage });
    store.getState().selectApiNode('overseas');
    store.getState().setNextRequestMode('mock');
    store.getState().setSession(mockActiveSession);
    store.getState().logout();

    expect(store.getState().auth.session).toBeNull();
    expect(store.getState().selectedApiNodeId).toBe('overseas');
    expect(store.getState().requestMode).toBe('mock');

    const rehydratedStore = createAppStore({ storage });
    await rehydratedStore.persist.rehydrate();
    expect(rehydratedStore.getState().auth.session).toBeNull();
    expect(rehydratedStore.getState().selectedApiNodeId).toBe('overseas');
  });

});

describe('Persisted store format', () => {
  const emptyState = {
    auth: { session: null },
    requestMode: 'remote' as const,
    selectedApiNodeId: 'domestic' as const,
  };

  it('stores client state under the single app key', () => {
    const { storage, values } = createMemoryStorage();
    const store = createAppStore({ storage });
    store.getState().setSession(mockActiveSession);
    expect([...values.keys()]).toEqual([APP_STORE_STORAGE_KEY]);
  });

  it('defaults a missing startup request mode in the existing envelope', async () => {
    const { storage } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: JSON.stringify({
        state: {
          auth: { session: mockActiveSession },
          selectedApiNodeId: 'overseas',
        },
        version: 0,
      }),
    });

    const store = createAppStore({ storage });
    await store.persist.rehydrate();
    expect(store.getState()).toMatchObject({
      auth: { session: mockActiveSession },
      requestMode: 'remote',
      selectedApiNodeId: 'overseas',
    });
  });

  it('ignores stored state that does not match the current shape', async () => {
    const { storage } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: JSON.stringify({
        state: {
          auth: { session: mockActiveSession },
          games: null,
          network: { selectedApiNodeId: 'overseas' },
        },
        version: 0,
      }),
    });

    const store = createAppStore({ storage });
    await store.persist.rehydrate();
    expect(store.getState()).toMatchObject(emptyState);
  });

  it('ignores malformed stored values', () => {
    const { storage } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: '{invalid',
    });
    const store = createAppStore({ storage });
    expect(store.getState()).toMatchObject(emptyState);
  });
});
