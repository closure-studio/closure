import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mockActiveSession, mockAdminSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { arkHostApi } from './api';
import {
  arkHostQueryKeys,
  useArkHostSync,
  useSessionQueryCacheReset,
} from './queries';

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
  await act(() => {
    appStore.getState().logout();
  });
});

describe('useSessionQueryCacheReset', () => {
  it('removes private queries when the principal changes', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(arkHostQueryKeys.detail('account-1'), { value: 1 });
    queryClient.setQueryData(['api-nodes'], { value: 2 });

    await act(() => {
      appStore.getState().setSession(mockAdminSession);
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(arkHostQueryKeys.detail('account-1'))).toBeUndefined();
      expect(queryClient.getQueryData(['api-nodes'])).toEqual({ value: 2 });
    });
  });

  it('removes private queries on logout while preserving public queries', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(arkHostQueryKeys.logs('account-1'), { logs: [] });
    queryClient.setQueryData(['api-nodes'], { value: 1 });
    queryClient.setQueryData(['game-resources', 'item'], { value: 2 });

    await act(() => {
      appStore.getState().logout();
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(arkHostQueryKeys.logs('account-1'))).toBeUndefined();
      expect(queryClient.getQueryData(['api-nodes'])).toEqual({ value: 1 });
      expect(queryClient.getQueryData(['game-resources', 'item'])).toEqual({ value: 2 });
    });
  });
});

describe('useArkHostSync session cleanup', () => {
  it('unsubscribes from the authenticated event stream on logout', async () => {
    const unsubscribe = jest.fn();
    const subscribe = jest.spyOn(arkHostApi, 'subscribe').mockReturnValue({ unsubscribe });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useArkHostSync(), { wrapper });

    expect(subscribe).toHaveBeenCalledWith(
      mockActiveSession.accessToken,
      expect.any(Function),
    );

    await act(() => {
      appStore.getState().logout();
    });

    await waitFor(() => {
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
