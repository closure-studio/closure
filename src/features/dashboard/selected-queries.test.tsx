import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mockActiveSession } from '@/mocks/auth';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import {
  configureQueryDependencies,
  resetQueryDependencies,
} from '@/services/query-dependencies';
import { appStore } from '@/store';
import type { ArkHostApi, ArkHostFailure, ArkHostResult } from './api';
import {
  useSelectedCharactersQuery,
  useSelectedGameAccount,
  useSelectedGameDetailQuery,
  useSelectedGameLogsQuery,
} from './queries';

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

function success<T>(data: T): ArkHostResult<T> {
  return { data, ok: true };
}
function failure(error: ArkHostFailure): ArkHostResult<never> {
  return { error, ok: false };
}

function createArkHostApi(overrides: Partial<ArkHostApi> = {}): ArkHostApi {
  return {
    deleteGame: () => Promise.resolve(success(true)),
    fetchCharacters: () => Promise.resolve(success({ chars: [], total: 0 })),
    fetchGameDetail: () => Promise.resolve(success(null)),
    fetchGameList: () => Promise.resolve(success(mockArkHostGameListResponse.data ?? [])),
    fetchGameLogs: () => Promise.resolve(success({ hasMore: false, logs: [] })),
    subscribe: () => ({ unsubscribe: () => {} }),
    ...overrides,
  };
}

beforeEach(async () => {
  resetQueryDependencies();
  configureQueryDependencies({ arkHostApi: createArkHostApi() });
  await act(() => {
    appStore.getState().logout();
    appStore.getState().selectGameAccount(null);
  });
});

describe('useSelectedGameAccount', () => {
  it('returns the account matching the store selection', async () => {
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G16601716973');
    });
    const { result } = await renderHook(() => useSelectedGameAccount(), { wrapper });

    await waitFor(() => {
      expect(result.current?.account).toBe('G16601716973');
      expect(result.current?.nickname).toBe('76t7tu');
    });
  });

  it('returns null without an active selection after the list has loaded', async () => {
    const fetchGameList = jest.fn(() => Promise.resolve(success(mockArkHostGameListResponse.data ?? [])));
    configureQueryDependencies({ arkHostApi: createArkHostApi({ fetchGameList }) });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    const { result } = await renderHook(() => useSelectedGameAccount(), { wrapper });

    await waitFor(() => {
      expect(fetchGameList).toHaveBeenCalled();
    });
    expect(result.current).toBeNull();
  });

  it('returns null for an id missing from the list', async () => {
    const fetchGameList = jest.fn(() => Promise.resolve(success(mockArkHostGameListResponse.data ?? [])));
    configureQueryDependencies({ arkHostApi: createArkHostApi({ fetchGameList }) });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G-MISSING');
    });
    const { result } = await renderHook(() => useSelectedGameAccount(), { wrapper });

    await waitFor(() => {
      expect(fetchGameList).toHaveBeenCalled();
    });
    expect(result.current).toBeNull();
  });

  it('derives the new object when the selection changes', async () => {
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G16601716973');
    });
    const { result } = await renderHook(() => useSelectedGameAccount(), { wrapper });
    await waitFor(() => {
      expect(result.current?.account).toBe('G16601716973');
    });

    await act(() => {
      appStore.getState().selectGameAccount('G17107372623');
    });

    expect(result.current?.account).toBe('G17107372623');
  });
});

describe('selected server resource hooks', () => {
  it('query the current selection id and follow selection changes', async () => {
    const fetchGameDetail = jest.fn((_account: string) => Promise.resolve(success(null)));
    configureQueryDependencies({ arkHostApi: createArkHostApi({ fetchGameDetail }) });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G16601716973');
    });
    const { result } = await renderHook(() => useSelectedGameDetailQuery(), { wrapper });

    await waitFor(() => {
      expect(fetchGameDetail).toHaveBeenCalledWith('G16601716973');
      expect(result.current.isSuccess).toBe(true);
    });

    await act(() => {
      appStore.getState().selectGameAccount('G17107372623');
    });

    await waitFor(() => {
      expect(fetchGameDetail).toHaveBeenCalledWith('G17107372623');
    });
  });

  it('do not subscribe to the Game Account list query', async () => {
    const fetchGameList = jest.fn(() => Promise.resolve(success(mockArkHostGameListResponse.data ?? [])));
    const fetchCharacters = jest.fn(() => Promise.resolve(success({ chars: [], total: 0 })));
    const fetchGameDetail = jest.fn((_account: string) => Promise.resolve(success(null)));
    const fetchGameLogs = jest.fn(() => Promise.resolve(success({ hasMore: false, logs: [] })));
    configureQueryDependencies({
      arkHostApi: createArkHostApi({ fetchCharacters, fetchGameDetail, fetchGameList, fetchGameLogs }),
    });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G16601716973');
    });
    const { result } = await renderHook(
      () => ({
        characters: useSelectedCharactersQuery(),
        detail: useSelectedGameDetailQuery(),
        logs: useSelectedGameLogsQuery(),
      }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.detail.isSuccess).toBe(true);
      expect(result.current.characters.isSuccess).toBe(true);
      expect(result.current.logs.isSuccess).toBe(true);
    });
    expect(fetchGameList).not.toHaveBeenCalled();
  });

  it('do not fire requests without an active selection', async () => {
    const fetchCharacters = jest.fn(() => Promise.resolve(success({ chars: [], total: 0 })));
    const fetchGameDetail = jest.fn((_account: string) => Promise.resolve(success(null)));
    const fetchGameLogs = jest.fn(() => Promise.resolve(success({ hasMore: false, logs: [] })));
    configureQueryDependencies({
      arkHostApi: createArkHostApi({ fetchCharacters, fetchGameDetail, fetchGameLogs }),
    });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
    });
    const { result } = await renderHook(
      () => ({
        characters: useSelectedCharactersQuery(),
        detail: useSelectedGameDetailQuery(),
        logs: useSelectedGameLogsQuery(),
      }),
      { wrapper },
    );

    expect(fetchGameDetail).not.toHaveBeenCalled();
    expect(fetchCharacters).not.toHaveBeenCalled();
    expect(fetchGameLogs).not.toHaveBeenCalled();
    expect(result.current.detail.isPending).toBe(true);
  });

  it('expose API failure as the query error', async () => {
    const fetchGameDetail = jest.fn((_account: string) => Promise.resolve(failure({
      code: 'network-unavailable',
      diagnosticMessage: 'offline',
      kind: 'transport',
    })));
    configureQueryDependencies({ arkHostApi: createArkHostApi({ fetchGameDetail }) });
    const { wrapper } = createWrapper();
    await act(() => {
      appStore.getState().setSession(mockActiveSession);
      appStore.getState().selectGameAccount('G16601716973');
    });
    const { result } = await renderHook(() => useSelectedGameDetailQuery(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error?.message).toBe('Request failed (network-unavailable)');
  });
});
