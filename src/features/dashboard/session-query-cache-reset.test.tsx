import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mockActiveSession, mockAdminSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { useSessionQueryCacheReset } from './queries';

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

beforeEach(async () => {
  await act(() => {
    appStore.getState().logout();
  });
});

describe('useSessionQueryCacheReset', () => {
  it('clears the Query cache when the session principal changes', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(['seed'], { value: 1 });
    expect(queryClient.getQueryCache().findAll()).toHaveLength(1);

    await act(() => {
      appStore.getState().setSession(mockAdminSession);
    });

    await waitFor(() => {
      expect(queryClient.getQueryCache().findAll()).toHaveLength(0);
    });
  });

  it('clears the Query cache on logout', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(['seed'], { value: 1 });

    await act(() => {
      appStore.getState().logout();
    });

    await waitFor(() => {
      expect(queryClient.getQueryCache().findAll()).toHaveLength(0);
    });
  });

  it('keeps the Query cache when the same principal refreshes its session', async () => {
    const { queryClient, wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    await renderHook(() => useSessionQueryCacheReset(), { wrapper });

    queryClient.setQueryData(['seed'], { value: 1 });

    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });

    expect(queryClient.getQueryCache().findAll()).toHaveLength(1);
  });
});
