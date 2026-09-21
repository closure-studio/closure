import { notifyManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import type { PropsWithChildren } from 'react';

import { mockActiveSession } from '@/mocks/auth';
import { authApi } from '@/services/api';
import {
  QQ_BINDING_GROUPS,
  useQQBindingController,
} from './use-qq-binding';

jest.mock('expo-clipboard', () => ({ setStringAsync: jest.fn() }));
jest.mock('expo-linking', () => ({ openURL: jest.fn() }));

const unboundState = {
  status: 'unbound',
  verificationCode: 'verifyCode:test-link',
} as const;
const boundState = { status: 'bound', verificationCode: null } as const;
let queryClient: QueryClient;

function Providers({ children }: PropsWithChildren) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeAll(() => {
  notifyManager.setScheduler(queueMicrotask);
});

afterAll(() => {
  notifyManager.setScheduler((callback) => setTimeout(callback, 0));
});

beforeEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
  queryClient = new QueryClient({
    defaultOptions: { queries: { gcTime: 0, retry: false } },
  });
  jest.mocked(Clipboard.setStringAsync).mockResolvedValue(true);
  jest.mocked(Linking.openURL).mockResolvedValue(true);
});

afterEach(() => {
  queryClient.clear();
  jest.useRealTimers();
});

it('loads binding status once and keeps copy and group actions separate', async () => {
  const fetchState = jest.spyOn(authApi, 'fetchQQBindingState').mockResolvedValue({
    data: unboundState,
    ok: true,
  });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  expect(fetchState).toHaveBeenCalledTimes(1);

  await act(async () => {
    await hook.result.current.copyVerificationCode();
  });
  expect(Clipboard.setStringAsync).toHaveBeenCalledWith(unboundState.verificationCode);
  expect(Linking.openURL).not.toHaveBeenCalled();
  expect(hook.result.current.copyStatus).toBe('copied');

  await act(async () => {
    await hook.result.current.openGroup(QQ_BINDING_GROUPS[0]);
  });
  expect(Linking.openURL).toHaveBeenCalledWith(QQ_BINDING_GROUPS[0].url);
  expect(Clipboard.setStringAsync).toHaveBeenCalledTimes(1);
});

it('starts polling only after the user explicitly begins detection', async () => {
  jest.useFakeTimers();
  const fetchState = jest.spyOn(authApi, 'fetchQQBindingState').mockResolvedValue({
    data: unboundState,
    ok: true,
  });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  await act(() => {
    jest.advanceTimersByTime(8_000);
  });
  expect(fetchState).toHaveBeenCalledTimes(1);

  await act(() => {
    hook.result.current.setDialogOpen(true);
    hook.result.current.startChecking();
  });
  await waitFor(() => expect(fetchState).toHaveBeenCalledTimes(2));

  await act(() => {
    jest.advanceTimersByTime(4_000);
  });
  await waitFor(() => expect(fetchState).toHaveBeenCalledTimes(3));
});

it('stops polling as soon as the server reports a linked account', async () => {
  jest.useFakeTimers();
  const fetchState = jest.spyOn(authApi, 'fetchQQBindingState')
    .mockResolvedValueOnce({ data: unboundState, ok: true })
    .mockResolvedValueOnce({ data: unboundState, ok: true })
    .mockResolvedValueOnce({ data: boundState, ok: true });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  await act(() => {
    hook.result.current.setDialogOpen(true);
    hook.result.current.startChecking();
  });
  await waitFor(() => expect(fetchState).toHaveBeenCalledTimes(2));

  await act(() => {
    jest.advanceTimersByTime(4_000);
  });
  await waitFor(() => {
    expect(hook.result.current.state).toEqual(boundState);
    expect(hook.result.current.isChecking).toBe(false);
  });

  await act(() => {
    jest.advanceTimersByTime(8_000);
  });
  expect(fetchState).toHaveBeenCalledTimes(3);
});

it('times out detection after sixty seconds and cancels further polling', async () => {
  jest.useFakeTimers();
  jest.spyOn(authApi, 'fetchQQBindingState').mockResolvedValue({
    data: unboundState,
    ok: true,
  });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  await act(() => {
    hook.result.current.setDialogOpen(true);
    hook.result.current.startChecking();
  });
  await act(() => {
    jest.advanceTimersByTime(60_000);
  });
  await waitFor(() => {
    expect(hook.result.current.timedOut).toBe(true);
    expect(hook.result.current.isChecking).toBe(false);
  });
});

it('aborts an active status request when the dialog closes', async () => {
  const activeSignals: AbortSignal[] = [];
  jest.spyOn(authApi, 'fetchQQBindingState')
    .mockResolvedValueOnce({ data: unboundState, ok: true })
    .mockImplementation((_accessToken, signal) => {
      activeSignals.push(signal);
      return new Promise(() => undefined);
    });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  await act(() => {
    hook.result.current.setDialogOpen(true);
    hook.result.current.startChecking();
  });
  await waitFor(() => expect(activeSignals).toHaveLength(1));

  await act(() => {
    hook.result.current.setDialogOpen(false);
  });

  expect(activeSignals[0]?.aborted).toBe(true);
  expect(hook.result.current.isChecking).toBe(false);
});

it('reloads status when reopening after the initial request was cancelled', async () => {
  const activeSignals: AbortSignal[] = [];
  const fetchState = jest.spyOn(authApi, 'fetchQQBindingState')
    .mockImplementationOnce((_accessToken, signal) => {
      activeSignals.push(signal);
      return new Promise(() => undefined);
    })
    .mockResolvedValueOnce({ data: unboundState, ok: true });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(activeSignals).toHaveLength(1));
  await act(() => {
    hook.result.current.setDialogOpen(true);
    hook.result.current.setDialogOpen(false);
  });
  await waitFor(() => expect(hook.result.current.isFetching).toBe(false));
  expect(activeSignals[0]?.aborted).toBe(true);

  await act(() => {
    hook.result.current.setDialogOpen(true);
  });
  await waitFor(() => expect(hook.result.current.state).toEqual(unboundState));
  expect(fetchState).toHaveBeenCalledTimes(2);
});

it('aborts an active status request when the account view unmounts', async () => {
  const activeSignals: AbortSignal[] = [];
  jest.spyOn(authApi, 'fetchQQBindingState').mockImplementation((_accessToken, signal) => {
    activeSignals.push(signal);
    return new Promise(() => undefined);
  });
  const hook = await renderHook(
    () => useQQBindingController(mockActiveSession),
    { wrapper: Providers },
  );

  await waitFor(() => expect(activeSignals).toHaveLength(1));
  await hook.unmount();

  expect(activeSignals[0]?.aborted).toBe(true);
});
