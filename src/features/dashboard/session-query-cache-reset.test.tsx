import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { mockActiveSession, mockAdminSession } from '@/mocks/auth';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { appStore } from '@/store';
import { arkHostApi } from './api';
import {
  arkHostQueryKeys,
  subscribeToLiveGameLogs,
  useArkHostSync,
  useSessionQueryCacheReset,
} from './queries';

const API_NODES_QUERY_KEY = ['api-nodes'] as const;
const GAME_RESOURCES_QUERY_KEY = ['game-resources', 'item'] as const;
const originalAppStateDescriptor = Object.getOwnPropertyDescriptor(AppState, 'currentState');
let appStateListener: ((state: AppStateStatus) => void) | undefined;

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
  jest.restoreAllMocks();
  appStateListener = undefined;
  Object.defineProperty(AppState, 'currentState', {
    configurable: true,
    value: 'active',
  });
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    appStateListener = listener;
    return { remove: () => undefined };
  });
  await act(() => {
    appStore.getState().logout();
    appStore.getState().selectApiNode('domestic');
  });
});

afterAll(() => {
  if (originalAppStateDescriptor) {
    Object.defineProperty(AppState, 'currentState', originalAppStateDescriptor);
  }
});

afterEach(() => {
  jest.useRealTimers();
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

  it('unsubscribes from the authenticated event stream on logout', async () => {
    const unsubscribe = jest.fn();
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useArkHostSync(), { wrapper });

    const call = subscribe.mock.calls[0];
    if (!call) throw new Error('Expected SSE subscription');
    expect(call[0]).toBe(mockActiveSession.accessToken);
    expect(typeof call[1].onConnected).toBe('function');
    expect(typeof call[1].onDisconnected).toBe('function');
    expect(typeof call[1].onEvent).toBe('function');
    expect(typeof call[1].onServerClose).toBe('function');
    expect(call[2]).toBeInstanceOf(AbortSignal);

    await act(() => {
      appStore.getState().logout();
    });

    await waitFor(() => {
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  it('updates the game list and refetches active detail data on game events', async () => {
    const unsubscribe = jest.fn();
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe });
    const { queryClient, wrapper } = createWrapper();
    const refetchQueries = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useArkHostSync(), { wrapper });
    const handlers = subscribe.mock.calls[0]?.[1];
    if (!handlers) throw new Error('Expected SSE handlers');
    const entries = mockArkHostGameListResponse.code === 1
      ? mockArkHostGameListResponse.data
      : [];

    await act(async () => {
      handlers.onEvent({ data: entries, type: 'game' });
      await Promise.resolve();
    });

    expect(queryClient.getQueryData(arkHostQueryKeys.gameAccounts(
      mockActiveSession.principal.id,
    ))).toHaveLength(entries.length);
    expect(refetchQueries).toHaveBeenCalledWith(
      { queryKey: arkHostQueryKeys.details(), type: 'active' },
      { cancelRefetch: false },
    );
  });

  it('caches SSE logs by account, notifies once for new entries, and stops notifying after unsubscribe', async () => {
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe: jest.fn() });
    const { queryClient, wrapper } = createWrapper();
    await act(() => appStore.getState().setSession(mockActiveSession));
    const hook = await renderHook(() => useArkHostSync(), { wrapper });
    const handlers = subscribe.mock.calls[0]?.[1];
    if (!handlers) throw new Error('Expected SSE handlers');
    const onLog = jest.fn();
    const stopListening = subscribeToLiveGameLogs(onLog);
    const log = { content: 'Live log', id: 10, logLevel: 1, name: 'G1', ts: 100 };

    await act(() => {
      handlers.onEvent({ data: log, type: 'log' });
      handlers.onEvent({ data: log, type: 'log' });
    });
    expect(queryClient.getQueryData(arkHostQueryKeys.logs('G1'))).toEqual({
      hasMore: true, logs: [log],
    });
    expect(onLog).toHaveBeenCalledTimes(1);
    stopListening();
    await act(() => handlers.onEvent({ data: { ...log, id: 11 }, type: 'log' }));
    expect(queryClient.getQueryData<{ logs: typeof log[] }>(arkHostQueryKeys.logs('G1'))?.logs).toHaveLength(2);
    expect(onLog).toHaveBeenCalledTimes(1);
    await hook.unmount();
  });

  it('polls active ArkHost state only while the stream is disconnected', async () => {
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe: jest.fn() });
    const { queryClient, wrapper } = createWrapper();
    const refetchQueries = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    const hook = await renderHook(() => useArkHostSync(), { wrapper });
    const handlers = subscribe.mock.calls[0]?.[1];
    if (!handlers) throw new Error('Expected SSE handlers');
    jest.useFakeTimers();

    await act(async () => {
      handlers.onDisconnected();
      await Promise.resolve();
    });
    expect(refetchQueries).toHaveBeenCalledTimes(2);

    await act(async () => {
      await jest.advanceTimersByTimeAsync(30_000);
    });
    expect(refetchQueries).toHaveBeenCalledTimes(4);

    await act(async () => {
      handlers.onConnected();
      await Promise.resolve();
    });
    await act(async () => {
      await jest.advanceTimersByTimeAsync(60_000);
    });
    expect(refetchQueries).toHaveBeenCalledTimes(4);
    await act(async () => {
      await hook.unmount();
    });
  });

  it('stops in the background and refreshes before reconnecting in the foreground', async () => {
    const unsubscribes: jest.Mock[] = [];
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockImplementation(() => {
      const unsubscribe = jest.fn();
      unsubscribes.push(unsubscribe);
      return { unsubscribe };
    });
    const { queryClient, wrapper } = createWrapper();
    const refetchQueries = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useArkHostSync(), { wrapper });
    if (!appStateListener) throw new Error('Expected AppState listener');

    await act(async () => {
      appStateListener?.('background');
      await Promise.resolve();
    });
    expect(unsubscribes[0]).toHaveBeenCalledTimes(1);

    await act(async () => {
      appStateListener?.('active');
      await Promise.resolve();
    });
    expect(refetchQueries).toHaveBeenCalledTimes(2);
    expect(subscribe).toHaveBeenCalledTimes(2);
  });

  it('does not poll or reconnect after the server explicitly closes the stream', async () => {
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe: jest.fn() });
    const { queryClient, wrapper } = createWrapper();
    const refetchQueries = jest.spyOn(queryClient, 'refetchQueries').mockResolvedValue();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useArkHostSync(), { wrapper });
    const handlers = subscribe.mock.calls[0]?.[1];
    if (!handlers || !appStateListener) throw new Error('Expected sync handlers');

    await act(async () => {
      handlers.onServerClose();
      handlers.onDisconnected();
      appStateListener?.('background');
      appStateListener?.('active');
      await Promise.resolve();
    });

    expect(refetchQueries).not.toHaveBeenCalled();
    expect(subscribe).toHaveBeenCalledTimes(1);
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
