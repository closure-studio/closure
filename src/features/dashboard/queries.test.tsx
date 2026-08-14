import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { MockArkHostApi } from './api';
import {
  arkHostQueryKeys,
  useActiveCharacters,
  useActiveGameAccount,
  useActiveLogs,
  useArkHostStream,
  useGamesQuery,
} from './queries';
import type { GamesSnapshot } from './queries';
import {
  configureQueryDependencies,
  resetQueryDependencies,
} from '@/services/query-dependencies';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { mockActiveSession } from '@/mocks/auth';
import { appStore } from '@/store';

const EXPECTED_GAME_ACCOUNT_COUNT = 3;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: 0, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

async function signIn() {
  await act(() => {
    appStore.getState().setSession(mockActiveSession);
  });
}

beforeEach(async () => {
  resetQueryDependencies();
  configureQueryDependencies({ arkHostApi: new MockArkHostApi(0) });
  await act(() => {
    appStore.getState().logout();
  });
});

describe('ArkHost queries', () => {
  it('loads the snapshot and defaults the active game account', async () => {
    const { wrapper } = createWrapper();
    await signIn();
    const { result } = await renderHook(
      () => ({ active: useActiveGameAccount(), games: useGamesQuery() }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.games.isSuccess).toBe(true);
    });
    expect(result.current.games.data?.gameAccounts).toHaveLength(
      EXPECTED_GAME_ACCOUNT_COUNT,
    );
    expect(result.current.active?.account).toBe('G18928069156');
  });

  it('loads the distinct roster and logs of a selected account', async () => {
    const { wrapper } = createWrapper();
    await signIn();
    const { result } = await renderHook(
      () => ({
        characters: useActiveCharacters(),
        logs: useActiveLogs(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.characters.total).toBe(422);
      expect(result.current.logs.logs.length).toBeGreaterThan(0);
    });
    await act(() => {
      appStore.getState().selectGameAccount('G16601716973');
    });
    await waitFor(() => {
      expect(result.current.characters.total).toBe(60);
    });
  });

  it('falls back to the first account when the active account disappears', async () => {
    const api = new MockArkHostApi(0);
    configureQueryDependencies({ arkHostApi: api });
    const { wrapper } = createWrapper();
    await signIn();
    const { result } = await renderHook(
      () => ({ active: useActiveGameAccount(), stream: useArkHostStream() }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.active?.account).toBe('G18928069156');
    });
    await act(() => {
      appStore.getState().selectGameAccount('G16601716973');
    });
    expect(result.current.active?.account).toBe('G16601716973');
    const remaining = structuredClone(mockArkHostGameListResponse.data)?.slice(0, 1);
    if (remaining) {
      await act(() => {
        api.emit({ data: remaining, type: 'game' });
      });
      expect(result.current.active?.account).toBe('G18928069156');
    }
  });

  it('unsubscribes the stream and stops patching the cache after logout', async () => {
    const api = new MockArkHostApi(0);
    configureQueryDependencies({ arkHostApi: api });
    const { queryClient, wrapper } = createWrapper();
    await signIn();
    await renderHook(
      () => ({ games: useGamesQuery(), stream: useArkHostStream() }),
      { wrapper },
    );
    const gamesKey = arkHostQueryKeys.games(mockActiveSession.principal.id);

    await waitFor(() => {
      expect(queryClient.getQueryData<GamesSnapshot>(gamesKey)).not.toBeUndefined();
    });

    await act(() => {
      appStore.getState().logout();
    });
    await act(() => {
      api.emit({
        data: [{
          account: 'G18928069156',
          avatar: { id: 'avatar_dyn_01', type: 'ICON' },
          charId: 'char_1015_aglna2',
          createdAt: 1786491807,
          gachaInfo: 'gacha',
          nickName: '博士',
        }],
        type: 'ssr',
      });
    });
    expect(queryClient.getQueryData(arkHostQueryKeys.gacha)).toBeUndefined();
  });
});
