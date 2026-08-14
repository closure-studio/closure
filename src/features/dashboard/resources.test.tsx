import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import type { GameResourcesApi } from './api';
import { GAME_RESOURCE_CACHE_KEYS } from './game-resource-cache';
import {
  bundledCharacterTable,
  bundledItemTable,
  bundledStageTable,
} from './game-data';
import {
  useCharacterTable,
  useItemTable,
  useStageTable,
} from './resources';
import { mmkvStateStorage } from '@/lib/mmkv';
import {
  configureQueryDependencies,
  resetQueryDependencies,
} from '@/services/query-dependencies';
import { appStore } from '@/store';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
}

function createGameResourcesApi(
  overrides: Partial<GameResourcesApi> = {},
): GameResourcesApi {
  return {
    fetchCharacter: () => Promise.resolve({ kind: 'not-modified' }),
    fetchItem: () => Promise.resolve({ kind: 'not-modified' }),
    fetchStage: () => Promise.resolve({ kind: 'not-modified' }),
    ...overrides,
  };
}

beforeEach(async () => {
  resetQueryDependencies();
  configureQueryDependencies({ gameResourcesApi: createGameResourcesApi() });
  for (const key of Object.values(GAME_RESOURCE_CACHE_KEYS)) {
    mmkvStateStorage.removeItem(key);
  }
  await act(() => {
    appStore.getState().logout();
  });
});

describe('Game resource queries', () => {
  it('updates each table independently and keeps bundled fallbacks', async () => {
    const updatedAt = '2026-08-11T10:20:41.000Z';
    const api = createGameResourcesApi({
      fetchCharacter: () => Promise.resolve({ kind: 'unavailable' }),
      fetchItem: () => Promise.resolve({
        kind: 'updated',
        table: { item_alpha: { icon: 'ITEM_ALPHA', name: '测试物品甲' } },
        updatedAt,
      }),
      fetchStage: () => Promise.reject(new Error('offline')),
    });
    configureQueryDependencies({ gameResourcesApi: api });
    const { wrapper } = createWrapper();
    const { result } = await renderHook(
      () => ({
        character: useCharacterTable(),
        item: useItemTable(),
        stage: useStageTable(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.item).toEqual({
        item_alpha: { icon: 'ITEM_ALPHA', name: '测试物品甲' },
      });
    });
    expect(result.current.character).toEqual(bundledCharacterTable);
    expect(result.current.stage).toEqual(bundledStageTable);
  });

  it('keeps the bundled table when the server has nothing newer', async () => {
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => ({ item: useItemTable() }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.item).toEqual(bundledItemTable);
    });
  });

  it('deduplicates concurrent consumers and skips refetches within 24 hours', async () => {
    const fetchItem = jest.fn().mockResolvedValue({ kind: 'not-modified' });
    const api = createGameResourcesApi({ fetchItem });
    configureQueryDependencies({ gameResourcesApi: api });
    const { wrapper } = createWrapper();

    const first = await renderHook(() => ({ item: useItemTable() }), { wrapper });
    const second = await renderHook(() => ({ item: useItemTable() }), { wrapper });
    await waitFor(() => {
      expect(first.result.current.item).toEqual(bundledItemTable);
      expect(second.result.current.item).toEqual(bundledItemTable);
    });
    expect(fetchItem).toHaveBeenCalledTimes(1);

    await first.unmount();
    await second.unmount();
    const remounted = await renderHook(() => ({ item: useItemTable() }), {
      wrapper,
    });
    await waitFor(() => {
      expect(remounted.result.current.item).toEqual(bundledItemTable);
    });
    expect(fetchItem).toHaveBeenCalledTimes(1);
  });

  it('persists an updated table and serves it on a fresh mount', async () => {
    const updatedAt = '2026-08-12T10:20:41.000Z';
    const updatedTable = { item_alpha: { icon: 'ITEM_ALPHA', name: '测试物品甲' } };
    const api = createGameResourcesApi({
      fetchItem: () => Promise.resolve({
        kind: 'updated',
        table: updatedTable,
        updatedAt,
      }),
    });
    configureQueryDependencies({ gameResourcesApi: api });
    const { wrapper } = createWrapper();
    const first = await renderHook(() => ({ item: useItemTable() }), {
      wrapper,
    });
    await waitFor(() => {
      expect(first.result.current.item).toEqual(updatedTable);
    });

    const raw = mmkvStateStorage.getItem(GAME_RESOURCE_CACHE_KEYS.item);
    if (typeof raw !== 'string') throw new Error('expected persisted game resource cache');
    expect(JSON.parse(raw)).toEqual({ table: updatedTable, updatedAt });
    await first.unmount();

    configureQueryDependencies({ gameResourcesApi: createGameResourcesApi() });
    const second = await renderHook(() => ({ item: useItemTable() }), {
      wrapper,
    });
    await waitFor(() => {
      expect(second.result.current.item).toEqual(updatedTable);
    });
  });

  it('falls back to bundled data when the persisted cache is corrupt', async () => {
    mmkvStateStorage.setItem(GAME_RESOURCE_CACHE_KEYS.item, '{invalid');
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => ({ item: useItemTable() }), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.item).toEqual(bundledItemTable);
    });
  });
});
