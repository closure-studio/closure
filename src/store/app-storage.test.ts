import {
  APP_STORE_STORAGE_KEY,
  GAME_RESOURCES_STORAGE_KEY,
  createAppPersistStorage,
} from './app-storage';
import type { SyncStateStorage } from './app-storage';

function createMemoryStorage(initial: Readonly<Record<string, string>> = {}) {
  const values = new Map(Object.entries(initial));
  const storage: SyncStateStorage = {
    getItem: (name) => values.get(name) ?? null,
    removeItem: (name) => values.delete(name),
    setItem: (name, value) => values.set(name, value),
  };
  return { storage, values };
}

const emptyResources = {
  character: null,
  checkedAt: null,
  item: null,
  stage: null,
};

describe('App persist storage', () => {
  it('stores app and game resources in two fixed keys', () => {
    const { storage, values } = createMemoryStorage();
    const persistStorage = createAppPersistStorage(storage);

    persistStorage.setItem('ignored', {
      state: {
        app: { auth: { session: null }, games: null },
        gameResources: emptyResources,
      },
    });
    expect(values.has(APP_STORE_STORAGE_KEY)).toBe(true);
    expect(values.has(GAME_RESOURCES_STORAGE_KEY)).toBe(true);
  });

  it('does not serialize the unchanged resource slice again', () => {
    const { storage } = createMemoryStorage();
    const setItem = jest.spyOn(storage, 'setItem');
    const persistStorage = createAppPersistStorage(storage);
    const state = {
      app: { auth: { session: null }, games: null },
      gameResources: emptyResources,
    };
    persistStorage.setItem('ignored', { state });
    persistStorage.setItem('ignored', {
      state: { app: { ...state.app }, gameResources: state.gameResources },
    });

    expect(setItem.mock.calls.filter(([key]) => key === GAME_RESOURCES_STORAGE_KEY)).toHaveLength(1);
  });

  it('clears only the malformed key while restoring the valid key', () => {
    const { storage, values } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: '{invalid',
      [GAME_RESOURCES_STORAGE_KEY]: JSON.stringify(emptyResources),
    });
    const persistStorage = createAppPersistStorage(storage);

    expect(persistStorage.getItem('ignored')).toEqual({
      state: {
        app: { auth: { session: null }, games: null },
        gameResources: emptyResources,
      },
    });
    expect(values.has(APP_STORE_STORAGE_KEY)).toBe(false);
    expect(values.has(GAME_RESOURCES_STORAGE_KEY)).toBe(true);
  });

  it('restores the previous Zustand envelope stored under the app key', () => {
    const app = { auth: { session: null }, games: null };
    const { storage } = createMemoryStorage({
      [APP_STORE_STORAGE_KEY]: JSON.stringify({ state: app, version: 0 }),
    });
    const persistStorage = createAppPersistStorage(storage);

    expect(persistStorage.getItem('ignored')).toEqual({
      state: { app, gameResources: emptyResources },
    });
  });
});
