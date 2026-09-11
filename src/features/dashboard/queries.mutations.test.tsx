import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { PropsWithChildren } from 'react';

import { mockActiveSession } from '@/mocks/auth';
import { appStore } from '@/store';
import { arkHostApi } from './api';
import {
  arkHostQueryKeys,
  useDeleteGame,
  useLoginGame,
  usePauseGame,
  useUpdateGameConfig,
} from './queries';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { gcTime: 0, retry: false },
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
    appStore.getState().setSession(mockActiveSession);
  });
});

afterEach(async () => {
  await act(() => {
    appStore.getState().logout();
  });
});

describe('game account mutations', () => {
  it('invalidates only the config-owning detail after a config update succeeds', async () => {
    const updateGameConfig = jest.spyOn(arkHostApi, 'updateGameConfig').mockResolvedValue({
      data: undefined,
      ok: true,
    });
    const { queryClient, wrapper } = createWrapper();
    const account = 'G1';
    const patch = { keeping_ap: 12 };
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result, unmount } = await renderHook(() => useUpdateGameConfig(account), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(patch);
    });

    expect(updateGameConfig).toHaveBeenCalledWith(account, patch);
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: arkHostQueryKeys.detail(account),
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    await unmount();
    queryClient.clear();
  });

  it('routes login and pause mutations to their matching API methods', async () => {
    const loginGame = jest.spyOn(arkHostApi, 'loginGame').mockResolvedValue({
      data: undefined,
      ok: true,
    });
    const pauseGame = jest.spyOn(arkHostApi, 'pauseGame').mockResolvedValue({
      data: undefined,
      ok: true,
    });
    const { queryClient, wrapper } = createWrapper();
    const { result, unmount } = await renderHook(() => ({
      login: useLoginGame(),
      pause: usePauseGame(),
    }), { wrapper });

    await act(async () => {
      await result.current.login.mutateAsync('G1');
    });
    await waitFor(() => {
      expect(loginGame).toHaveBeenCalledTimes(1);
    });
    await act(async () => {
      await result.current.pause.mutateAsync('G1');
    });
    await waitFor(() => {
      expect(result.current.pause.isSuccess).toBe(true);
    });

    expect(loginGame).toHaveBeenCalledWith('G1');
    expect(pauseGame).toHaveBeenCalledTimes(1);
    expect(pauseGame).toHaveBeenCalledWith('G1');
    await unmount();
    queryClient.clear();
  });

  it('invalidates only the status-owning list after a pause succeeds', async () => {
    jest.spyOn(arkHostApi, 'pauseGame').mockResolvedValue({ data: undefined, ok: true });
    const { queryClient, wrapper } = createWrapper();
    const account = 'G1';
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const { result, unmount } = await renderHook(() => usePauseGame(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(account);
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: arkHostQueryKeys.gameAccounts(mockActiveSession.principal.id),
    });
    expect(invalidateQueries).toHaveBeenCalledTimes(1);
    await unmount();
    queryClient.clear();
  });

  it('removes account caches and invalidates the list after deletion', async () => {
    const deleteGame = jest.spyOn(arkHostApi, 'deleteGame').mockResolvedValue({
      data: undefined,
      ok: true,
    });
    const { queryClient, wrapper } = createWrapper();
    const account = 'G1';
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const removeQueries = jest.spyOn(queryClient, 'removeQueries');
    const { result, unmount } = await renderHook(() => useDeleteGame(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync(account);
    });
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(deleteGame).toHaveBeenCalledWith(account);
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: arkHostQueryKeys.detail(account),
    });
    expect(removeQueries).toHaveBeenCalledWith({
      queryKey: arkHostQueryKeys.logs(account),
    });
    expect(invalidateQueries).toHaveBeenCalledWith({
      queryKey: arkHostQueryKeys.gameAccounts(mockActiveSession.principal.id),
    });
    await unmount();
    queryClient.clear();
  });
});
