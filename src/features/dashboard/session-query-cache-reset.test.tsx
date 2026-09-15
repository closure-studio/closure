import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mockActiveSession, mockAdminSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { arkHostQueryKeys, useSessionQueryCacheReset } from './queries';

const API_NODES_QUERY_KEY = ['api-nodes'] as const;
const GAME_RESOURCES_QUERY_KEY = ['game-resources', 'item'] as const;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { gcTime: Infinity, retry: false },
    },
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
}

beforeEach(async () => {
  await act(() => {
    appStore.getState().logout();
    appStore.getState().selectApiNode('domestic');
  });
});

describe('useSessionQueryCacheReset', () => {
  it('cancels and removes only ArkHost queries when the account changes', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    let arkHostSignal: AbortSignal | undefined;
    const pendingArkHostQuery = queryClient.fetchQuery({
      queryKey: arkHostQueryKeys.gameAccounts(mockActiveSession.principal.id),
      queryFn: ({ signal }) => {
        arkHostSignal = signal;
        return new Promise<never>(() => undefined);
      },
    }).catch(() => undefined);
    queryClient.setQueryData(API_NODES_QUERY_KEY, ['public-node']);
    queryClient.setQueryData(GAME_RESOURCES_QUERY_KEY, { table: 'public-resource' });
    await waitFor(() => expect(arkHostSignal).toBeDefined());

    await act(() => {
      appStore.getState().setSession(mockAdminSession);
    });

    await waitFor(() => {
      expect(arkHostSignal?.aborted).toBe(true);
      expect(queryClient.getQueryData(arkHostQueryKeys.gameAccounts(
        mockActiveSession.principal.id,
      ))).toBeUndefined();
    });
    expect(queryClient.getQueryData(API_NODES_QUERY_KEY)).toEqual(['public-node']);
    expect(queryClient.getQueryData(GAME_RESOURCES_QUERY_KEY)).toEqual({
      table: 'public-resource',
    });
    await pendingArkHostQuery;
  });

  it('removes only ArkHost queries on logout', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(arkHostQueryKeys.detail('G1'), { account: 'G1' });
    queryClient.setQueryData(GAME_RESOURCES_QUERY_KEY, { table: 'public-resource' });

    await act(() => {
      appStore.getState().logout();
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(arkHostQueryKeys.detail('G1'))).toBeUndefined();
    });
    expect(queryClient.getQueryData(GAME_RESOURCES_QUERY_KEY)).toEqual({
      table: 'public-resource',
    });
  });

  it('removes ArkHost queries but preserves public queries when the node changes', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    const oldNodeKey = arkHostQueryKeys.detail('G1');
    queryClient.setQueryData(oldNodeKey, { account: 'G1' });
    queryClient.setQueryData(API_NODES_QUERY_KEY, ['public-node']);

    await act(() => {
      appStore.getState().selectApiNode('overseas');
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(oldNodeKey)).toBeUndefined();
    });
    expect(queryClient.getQueryData(API_NODES_QUERY_KEY)).toEqual(['public-node']);
  });
});
