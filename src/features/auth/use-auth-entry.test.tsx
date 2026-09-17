import { act, renderHook, waitFor } from '@testing-library/react-native';
import { notifyManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { StrictMode } from 'react';
import type { PropsWithChildren } from 'react';
import { appStore } from '@/store';
import { i18n } from '@/i18n';
import { mockActiveSession } from '@/mocks/auth';
import { useAuthEntry, useLinuxDoCallback } from './use-auth-entry';
import { authApi } from './api';
import type { AuthResult } from './api/auth-adapter';
import type { UserSession } from '@/schemas/auth';
import { finishVerification, runVerification } from '@/features/verification';
import { FailureError } from '@/utils/failure-error';
import { requestScope } from '@/services/request-scope';
import { toast } from '@tamagui/toast/v2';
import {
  beginLinuxDoAuthorization,
  completeLinuxDoAuthorization,
  takeLinuxDoWebCallback,
  watchAbandonedLinuxDoAuthorization,
} from './linuxdo';

const codeVerifier = '0123456789abcdef'.repeat(4);

jest.mock('@/services/request-scope', () => ({
  ...jest.requireActual<typeof import('@/services/request-scope')>('@/services/request-scope'),
  requestScope: jest.fn(),
}));
jest.mock('@tamagui/toast/v2', () => ({
  toast: { success: jest.fn() },
}));

jest.mock('./api', () => {
  const authApi = {
    login: jest.fn(), register: jest.fn(), resetPassword: jest.fn(),
    requestEmailCode: jest.fn(), loginWithLinuxDo: jest.fn(), updatePassword: jest.fn(),
  };
  return { authApi };
});
jest.mock('./linuxdo', () => ({
  linuxDoAvailable: true,
  beginLinuxDoAuthorization: jest.fn(),
  completeLinuxDoAuthorization: jest.fn(),
  takeLinuxDoWebCallback: jest.fn(),
  watchAbandonedLinuxDoAuthorization: jest.fn(),
}));

const mockedBeginLinuxDo = jest.mocked(beginLinuxDoAuthorization);
const mockedCompleteLinuxDo = jest.mocked(completeLinuxDoAuthorization);
const mockedTakeWebCallback = jest.mocked(takeLinuxDoWebCallback);
const mockedWatchAbandoned = jest.mocked(watchAbandonedLinuxDoAuthorization);
const mockedToastSuccess = jest.mocked(toast.success);
let client: QueryClient;

beforeAll(() => { notifyManager.setScheduler(queueMicrotask); });
afterAll(() => { notifyManager.setScheduler((callback) => { setTimeout(callback, 0); }); });

function Providers({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}><I18nextProvider i18n={i18n}>{children}</I18nextProvider></QueryClientProvider>;
}

function StrictProviders({ children }: PropsWithChildren) {
  return <StrictMode><Providers>{children}</Providers></StrictMode>;
}

beforeEach(async () => {
  jest.clearAllMocks();
  const scope = new AbortController();
  jest.mocked(requestScope).mockReturnValue(scope.signal);
  client = new QueryClient({ defaultOptions: { mutations: { retry: false, gcTime: 0 } } });
  appStore.getState().logout();
  mockedBeginLinuxDo.mockResolvedValue({
    callbackUrl: 'com.closurestudio.app.dev://oauth/linuxdo?code=one-time-code',
    context: { codeVerifier, expiresAt: Date.now() + 60_000, returnTo: '/settings/network' },
    type: 'callback',
  });
  mockedCompleteLinuxDo.mockImplementation((authorization) => ({
    input: {
      code: authorization.callbackUrl.includes('callback-code') ? 'callback-code' : 'one-time-code',
      code_verifier: authorization.context.codeVerifier,
    },
    returnTo: '/settings/network',
  }));
  mockedWatchAbandoned.mockReturnValue(() => undefined);
  mockedTakeWebCallback.mockReturnValue({
    callbackUrl: 'https://closure.ltsc.vip/auth/callback/linuxdo?code=callback-code',
    context: { codeVerifier, expiresAt: Date.now() + 60_000, returnTo: '/settings/network' },
    type: 'callback',
  });
  await i18n.changeLanguage('en');
});
afterEach(() => client.clear());

function deferred<T>() {
  let resolve: (value: T) => void = () => { throw new Error('Promise did not start'); };
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

it('deduplicates rapid main submissions and accepts a session through the Store', async () => {
  const result = deferred<AuthResult<UserSession>>();
  jest.spyOn(authApi, 'login').mockReturnValue(result.promise);
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => {
    hook.result.current.forms.onSubmit({ kind: 'login', identifier: 'doctor@example.com', password: 'password' });
    hook.result.current.forms.onSubmit({ kind: 'login', identifier: 'doctor@example.com', password: 'password' });
  });
  expect(jest.spyOn(authApi, 'login')).toHaveBeenCalledTimes(1);
  await waitFor(() => expect(hook.result.current.forms.submission.isPending).toBe(true));
  await act(() => result.resolve({ ok: true, data: mockActiveSession }));
  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  expect(mockedToastSuccess).toHaveBeenCalledWith('Terminal access granted');
});

it('allows a new entry flow to submit while the previous flow is still pending', async () => {
  const previous = deferred<AuthResult<UserSession>>();
  const current = deferred<AuthResult<UserSession>>();
  const login = jest.spyOn(authApi, 'login')
    .mockReturnValueOnce(previous.promise)
    .mockReturnValueOnce(current.promise);

  const previousHook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => previousHook.result.current.forms.onSubmit({ kind: 'login', identifier: 'old@example.com', password: 'old-password' }));
  await waitFor(() => expect(login).toHaveBeenCalledTimes(1));
  await previousHook.unmount();
  await act(async () => { await Promise.resolve(); });

  const currentHook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  expect(currentHook.result.current.forms.submission.isPending).toBe(false);
  await act(() => currentHook.result.current.forms.onSubmit({ kind: 'login', identifier: 'new@example.com', password: 'new-password' }));
  expect(login).toHaveBeenCalledTimes(2);

  await act(() => previous.resolve({ ok: true, data: mockActiveSession }));
  expect(appStore.getState().auth.session).toBeNull();
  await act(() => current.resolve({ ok: true, data: mockActiveSession }));
  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  expect(mockedToastSuccess).toHaveBeenCalledTimes(1);
  expect(mockedToastSuccess).toHaveBeenCalledWith('Terminal access granted');
});

it('accepts a registration session without showing a toast', async () => {
  jest.spyOn(authApi, 'register').mockResolvedValue({ ok: true, data: mockActiveSession });
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => hook.result.current.forms.onViewChange('register'));

  await act(() => hook.result.current.forms.onSubmit({
    kind: 'register', email: 'doctor@example.com', password: 'password123', code: '123456',
  }));

  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  expect(mockedToastSuccess).not.toHaveBeenCalled();
});

it('keeps code sending independent and exposes registration errors inline', async () => {
  const code = deferred<AuthResult<void>>();
  jest.spyOn(authApi, 'requestEmailCode').mockReturnValue(code.promise);
  jest.spyOn(authApi, 'register').mockResolvedValue({ ok: false, error: { kind: 'business', code: 'invalid-verification-code' } });
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => hook.result.current.forms.onViewChange('register', 'doctor@example.com'));
  await act(() => hook.result.current.forms.onSendCode({ email: 'doctor@example.com' }));
  await waitFor(() => expect(hook.result.current.forms.emailCode.isPending).toBe(true));
  expect(hook.result.current.forms.submission.isPending).toBe(false);
  await act(() => code.resolve({ ok: true, data: undefined }));
  await waitFor(() => expect(hook.result.current.forms.emailCode.sentEmail).toBe('doctor@example.com'));
  expect(mockedToastSuccess).not.toHaveBeenCalled();
  await act(() => hook.result.current.forms.onSubmit({
    kind: 'register', email: 'doctor@example.com', password: 'password123', code: '123456',
  }));
  await waitFor(() => expect(hook.result.current.forms.submission.error).toBe(
    'The verification code is incorrect. Check it and try again.',
  ));
  expect(mockedToastSuccess).not.toHaveBeenCalled();
});

it('exposes code request failures inline in the recovery view', async () => {
  jest.spyOn(authApi, 'requestEmailCode').mockResolvedValue({
    ok: false,
    error: { code: 'user-not-found', kind: 'business' },
  });
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => hook.result.current.forms.onViewChange('reset', 'missing@example.com'));

  await act(() => hook.result.current.forms.onSendCode({ email: 'missing@example.com' }));

  await waitFor(() => expect(hook.result.current.forms.emailCode.error).toBe(
    'No account matches that credential or email.',
  ));
});

it('clears stale code results and errors on form changes', async () => {
  const code = deferred<AuthResult<void>>();
  jest.spyOn(authApi, 'requestEmailCode').mockReturnValue(code.promise);
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => hook.result.current.forms.onViewChange('register'));
  await act(() => hook.result.current.forms.onSendCode({ email: 'doctor@example.com' }));
  await act(() => hook.result.current.forms.onViewChange('reset', 'another@example.com'));
  await act(() => code.resolve({ ok: true, data: undefined }));
  expect(hook.result.current.forms.emailCode.sentEmail).toBeNull();
  expect(hook.result.current.forms.initialEmail).toBe('another@example.com');
});

it('replaces a cancelled OAuth error with the next password-login error', async () => {
  mockedBeginLinuxDo.mockRejectedValueOnce(
    new FailureError({ code: 'oauth-cancelled', kind: 'authorization' }),
  );
  jest.spyOn(authApi, 'login').mockResolvedValue({
    ok: false,
    error: { code: 'invalid-credentials', kind: 'business' },
  });
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });

  await act(() => hook.result.current.forms.onBeginLinuxDo());
  await waitFor(() => expect(hook.result.current.forms.submission.kind).toBe('linuxdo'));
  expect(hook.result.current.forms.submission.error).toBe(i18n.t('auth:oauth.cancelled'));

  await act(() => hook.result.current.forms.onSubmit({
    kind: 'login', identifier: 'doctor@example.com', password: 'password',
  }));
  await waitFor(() => expect(hook.result.current.forms.submission.kind).toBe('form'));
  await waitFor(() => expect(hook.result.current.forms.submission.error).toBe(
    i18n.t('auth:login.errors.invalidCredentials'),
  ));
  expect(mockedToastSuccess).not.toHaveBeenCalled();
});

it('cancels registration verification when its local auth operation ends', async () => {
  const request = {
    kind: 'registration',
    email: 'doctor@example.com',
    password: 'password123',
  } as const;
  let verification: ReturnType<typeof runVerification> | undefined;
  jest.spyOn(authApi, 'register').mockImplementation(async (_input, signal) => {
    if (!signal) throw new Error('Expected operation cancellation signal');
    verification = runVerification(request, signal);
    await verification;
    return { ok: true, data: mockActiveSession };
  });
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  await act(() => hook.result.current.forms.onViewChange('register'));
  await act(() => hook.result.current.forms.onSubmit({
    kind: 'register', email: 'doctor@example.com', password: 'password123', code: '123456',
  }));

  try {
    await waitFor(() => expect(verification).toBeDefined());
    const pending = verification;
    if (!pending) throw new Error('Registration verification did not start');
    const cancellation = expect(pending).rejects.toThrow('cancelled');

    await act(() => hook.result.current.forms.onViewChange('login'));

    await cancellation;
    expect(appStore.getState().auth.session).toBeNull();
  } finally {
    finishVerification(request, null);
  }
});

it('begins native OAuth once, exchanges once, and keeps the login return target', async () => {
  jest.spyOn(authApi, 'loginWithLinuxDo').mockResolvedValue({ ok: true, data: mockActiveSession });
  const hook = await renderHook(() => useAuthEntry('/settings/network'), { wrapper: Providers });
  await act(() => {
    hook.result.current.forms.onBeginLinuxDo();
    hook.result.current.forms.onBeginLinuxDo();
  });
  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  expect(mockedBeginLinuxDo).toHaveBeenCalledTimes(1);
  expect(mockedBeginLinuxDo).toHaveBeenCalledWith(expect.any(AbortSignal), '/settings/network');
  expect(jest.spyOn(authApi, 'loginWithLinuxDo')).toHaveBeenCalledTimes(1);
  expect(jest.spyOn(authApi, 'loginWithLinuxDo')).toHaveBeenCalledWith({
    code: 'one-time-code', code_verifier: codeVerifier,
  }, expect.any(AbortSignal));
  expect(mockedToastSuccess).toHaveBeenCalledTimes(1);
  expect(mockedToastSuccess).toHaveBeenCalledWith('Terminal access granted');
});

it('completes a Web callback once and returns its original destination', async () => {
  jest.spyOn(authApi, 'loginWithLinuxDo').mockResolvedValue({ ok: true, data: mockActiveSession });
  const hook = await renderHook(() => useLinuxDoCallback(), { wrapper: Providers });

  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  await waitFor(() => expect(hook.result.current.destination).toBe('/settings/network'));
  expect(mockedTakeWebCallback).toHaveBeenCalledTimes(1);
  expect(jest.spyOn(authApi, 'loginWithLinuxDo')).toHaveBeenCalledTimes(1);
  expect(jest.spyOn(authApi, 'loginWithLinuxDo')).toHaveBeenCalledWith({
    code: 'callback-code', code_verifier: codeVerifier,
  }, expect.any(AbortSignal));
  expect(mockedToastSuccess).toHaveBeenCalledTimes(1);
  expect(mockedToastSuccess).toHaveBeenCalledWith('Terminal access granted');
});

it('does not cancel the only Web callback exchange during StrictMode effect replay', async () => {
  jest.spyOn(authApi, 'loginWithLinuxDo').mockResolvedValue({ ok: true, data: mockActiveSession });
  await renderHook(() => useLinuxDoCallback(), { wrapper: StrictProviders });

  await waitFor(() => expect(appStore.getState().auth.session).toEqual(mockActiveSession));
  expect(mockedTakeWebCallback).toHaveBeenCalledTimes(1);
  expect(jest.spyOn(authApi, 'loginWithLinuxDo')).toHaveBeenCalledTimes(1);
  expect(mockedToastSuccess).toHaveBeenCalledTimes(1);
});

it('does not accept a Web callback session after leaving the callback route', async () => {
  const pending = deferred<AuthResult<UserSession>>();
  const loginWithLinuxDo = jest.spyOn(authApi, 'loginWithLinuxDo').mockReturnValue(pending.promise);
  const hook = await renderHook(() => useLinuxDoCallback(), { wrapper: Providers });
  await waitFor(() => expect(loginWithLinuxDo).toHaveBeenCalledTimes(1));

  await hook.unmount();
  await act(async () => { await Promise.resolve(); });
  pending.resolve({ ok: true, data: mockActiveSession });
  await waitFor(() => expect(client.isMutating()).toBe(0));

  expect(appStore.getState().auth.session).toBeNull();
  expect(mockedToastSuccess).not.toHaveBeenCalled();
});

it('ignores callbacks from a form that is still finishing its exit animation', async () => {
  const hook = await renderHook(() => useAuthEntry('/dashboard'), { wrapper: Providers });
  const previous = hook.result.current.forms;
  await act(() => previous.onViewChange('register'));
  await act(() => {
    previous.onSubmit({ kind: 'login', identifier: 'old@example.com', password: 'old-password' });
    previous.onBeginLinuxDo();
    previous.onViewChange('reset');
  });
  expect(jest.spyOn(authApi, 'login')).not.toHaveBeenCalled();
  expect(mockedBeginLinuxDo).not.toHaveBeenCalled();
  expect(hook.result.current.forms.view).toBe('register');
});
