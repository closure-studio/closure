import { RemoteAuthAdapter, decodeSession } from './auth-adapter.remote';
import * as http from '@/services/http';
import { runVerification } from '@/features/verification';

jest.mock('@/features/verification', () => ({ runVerification: jest.fn() }));
const adapter = new RemoteAuthAdapter();
const signal = () => new AbortController().signal;
const claims = { email: 'new@example.com', uuid: 'user', status: -1, permission: 16, exp: 4102444800, createdAt: 1700000000 };
const token = `e30.${btoa(JSON.stringify(claims))}.signature`;
beforeEach(() => { jest.restoreAllMocks(); jest.clearAllMocks(); });

it('maps real claims and missing registration slots without inventing values', () => {
  expect(decodeSession({ token })).toMatchObject({ availableSlots: null, principal: { status: 'unverified', id: 'user' } });
});

it('logs in without invoking the registration signature script', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: { token, available_slot: 2 }, message: 'ok' });
  const operation = signal();
  expect((await adapter.login({ identifier: 'new@example.com', password: 'password' }, operation)).ok).toBe(true);
  expect(request).toHaveBeenCalledWith('https://passport.ltsc.vip/api/v1/login', { method: 'POST', body: { email: 'new@example.com', password: 'password' }, signal: operation });
  expect(runVerification).not.toHaveBeenCalled();
});

it('submits the original registration proof and carries its operation signal through', async () => {
  jest.mocked(runVerification).mockResolvedValue({ noise: 'noise', sign: 'sign' });
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: { token }, message: 'ok' });
  const signal = new AbortController().signal;
  await adapter.register({
    email: 'new@example.com', password: 'password', code: '123456',
  }, signal);
  expect(runVerification).toHaveBeenCalledWith({
    kind: 'registration', email: 'new@example.com', password: 'password',
  }, signal);
  expect(request).toHaveBeenCalledWith(expect.stringContaining('/register'), {
    method: 'POST', signal,
    body: { email: 'new@example.com', password: 'password', code: '123456', noise: 'noise', sign: 'sign' },
  });
});

it('uses the server password reset payload and accepts its boolean data', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: false, message: 'ok' });
  const operation = signal();
  await expect(adapter.resetPassword({ email: 'new@example.com', code: '123456', password: 'password' }, operation)).resolves.toEqual({ ok: true, data: undefined });
  expect(request).toHaveBeenCalledWith(expect.stringContaining('/forget'), { method: 'POST', body: { email: 'new@example.com', code: '123456', newPasswd: 'password' }, signal: operation });
});

it('rejects cancellation instead of mapping it to an invalid response', async () => {
  const controller = new AbortController();
  jest.spyOn(http, 'requestJson').mockImplementation(() => {
    controller.abort();
    return Promise.reject(new Error('fetch aborted'));
  });

  await expect(adapter.login({
    identifier: 'new@example.com',
    password: 'password',
  }, controller.signal)).rejects.toThrow('Request cancelled');
});

it('rejects malformed responses rather than building a session', async () => {
  jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: { token: 'broken' }, message: 'ok' });
  await expect(adapter.login({ identifier: 'new@example.com', password: 'password' }, signal())).resolves.toMatchObject({ ok: false, error: { code: 'invalid-response' } });
});

it('shares the email-code endpoint between registration and password reset', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: true, message: 'ok' });
  const operation = signal();
  await expect(adapter.requestEmailCode({ email: 'new@example.com' }, operation)).resolves.toEqual({ ok: true, data: undefined });
  expect(request).toHaveBeenCalledWith('https://passport.ltsc.vip/api/v1/mail/register/code', { method: 'POST', body: { email: 'new@example.com' }, signal: operation });
});

it('exchanges Linux.do codes through the existing server and validates its session', async () => {
  const request = jest.spyOn(http, 'requestJson').mockResolvedValue({ code: 1, data: { token }, message: 'ok' });
  const input = { code: 'one-time-code', code_verifier: '0123456789abcdef'.repeat(4) };
  const operation = signal();
  await expect(adapter.loginWithLinuxDo(input, operation)).resolves.toMatchObject({ ok: true, data: { principal: { email: 'new@example.com' } } });
  expect(request).toHaveBeenCalledWith('https://passport.ltsc.vip/api/v1/oauth/linuxdo/exchange', { method: 'POST', body: input, signal: operation });
  const exchangeCall = request.mock.calls[0];
  expect(exchangeCall).toBeDefined();
  expect(exchangeCall?.[1]?.body).not.toHaveProperty('redirect_uri');
  expect(runVerification).not.toHaveBeenCalled();
});
