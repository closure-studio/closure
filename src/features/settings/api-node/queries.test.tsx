import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { apiNodeApi } from './api';
import { useApiNodesQuery } from './queries';
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
  return { queryClient, wrapper };
}

beforeEach(async () => {
  jest.restoreAllMocks();
  await act(() => {
    appStore.getState().logout();
  });
});

describe('API Node queries', () => {
  it('queries API nodes once for concurrent consumers', async () => {
    const queryNodes = jest.fn().mockResolvedValue({
      data: [
        { id: 'domestic', description: 'Domestic', latencyMs: 20, outcome: 'reachable' },
        { id: 'overseas', description: 'Overseas', latencyMs: 120, outcome: 'reachable' },
      ],
      ok: true,
    });
    jest.spyOn(apiNodeApi, 'queryNodes').mockImplementation(queryNodes);
    const { wrapper } = createWrapper();

    const first = await renderHook(() => useApiNodesQuery(), { wrapper });
    const second = await renderHook(() => useApiNodesQuery(), { wrapper });
    await waitFor(() => {
      expect(first.result.current.data).toHaveLength(2);
      expect(second.result.current.data).toHaveLength(2);
    });
    expect(queryNodes).toHaveBeenCalledTimes(1);
  });

  it('keeps the previous nodes when a refresh fails', async () => {
    let shouldFail = false;
    const queryNodes = jest.fn().mockImplementation(() => Promise.resolve(shouldFail
      ? { error: { code: 'timeout', kind: 'transport' }, ok: false }
      : {
        data: [{ id: 'domestic', description: 'Domestic', latencyMs: 20, outcome: 'reachable' }],
        ok: true,
      }));
    jest.spyOn(apiNodeApi, 'queryNodes').mockImplementation(queryNodes);
    const { wrapper } = createWrapper();
    const { result } = await renderHook(() => useApiNodesQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.data).toHaveLength(1);
    });
    shouldFail = true;
    void result.current.refetch();
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.data).toHaveLength(1);
    expect(result.current.error?.code).toBe('timeout');
  });
});
