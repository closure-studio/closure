import { TextEncoder } from 'node:util';

import { mockActiveSession } from '@/mocks/auth';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';
import { appStore } from '@/store';
import type { ArkHostSseHandlers } from './arkhost-api';
import { RemoteArkHostApi } from './arkhost-api.remote';

const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
const createHandlers = (): ArkHostSseHandlers => ({
  onConnected: jest.fn(),
  onDisconnected: jest.fn(),
  onEvent: jest.fn(),
  onServerClose: jest.fn(),
});

beforeEach(() => {
  jest.useFakeTimers();
  appStore.getState().setSession(mockActiveSession);
});
afterEach(() => {
  appStore.getState().logout();
  jest.useRealTimers();
});

it('parses split SSE frames and treats an explicit close as terminal', async () => {
  const data = mockArkHostGameListResponse.code === 1 ? mockArkHostGameListResponse.data : [];
  const stream = `:heartbeat\n\nevent: game\ndata: ${JSON.stringify(data)}\n\nevent: close\ndata: close\n\n`;
  const chunks = [stream.slice(0, 19), stream.slice(19, 67), stream.slice(67)];
  const request = jest.fn(() => Promise.resolve({ ok: true, status: 200, body: { getReader: () => ({
    read: (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      const next = chunks.shift();
      return Promise.resolve(next === undefined
        ? { done: true, value: undefined }
        : { done: false, value: new TextEncoder().encode(next) });
    },
    releaseLock: jest.fn(),
  }) } }));
  const handlers = createHandlers();
  const subscription = new RemoteArkHostApi(request).subscribe('test-token', handlers);

  await flush();

  expect(handlers.onConnected).toHaveBeenCalledTimes(1);
  expect(handlers.onEvent).toHaveBeenCalledWith({ type: 'game', data });
  expect(handlers.onServerClose).toHaveBeenCalledTimes(1);
  expect(handlers.onDisconnected).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(10_000);
  expect(request).toHaveBeenCalledTimes(1);
  subscription.unsubscribe();
});

it('normalizes omitted captcha fields in game events', async () => {
  if (mockArkHostGameListResponse.code !== 1) throw new Error('Expected game list fixture');
  const entry = mockArkHostGameListResponse.data[0];
  if (!entry) throw new Error('Expected game account fixture');
  const captchaInfo = {
    captcha_type: entry.captcha_info.captcha_type,
    created: entry.captcha_info.created,
  };
  const data = [{ ...entry, captcha_info: captchaInfo }];
  const stream = `event: game\ndata: ${JSON.stringify(data)}\n\nevent: close\ndata: close\n\n`;
  let sent = false;
  const request = jest.fn(() => Promise.resolve({ ok: true, status: 200, body: { getReader: () => ({
    read: (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      if (sent) return Promise.resolve({ done: true, value: undefined });
      sent = true;
      return Promise.resolve({ done: false, value: new TextEncoder().encode(stream) });
    },
    releaseLock: jest.fn(),
  }) } }));
  const handlers = createHandlers();
  const subscription = new RemoteArkHostApi(request).subscribe('test-token', handlers);

  await flush();

  expect(handlers.onEvent).toHaveBeenCalledWith({
    type: 'game',
    data: [expect.objectContaining({
      captcha_info: {
        ...captchaInfo,
        challenge: '',
        geetestId: '',
        gt: '',
        riskType: '',
      },
    })],
  });
  subscription.unsubscribe();
});

it('aborts a silent connection and reconnects after reporting disconnection', async () => {
  const signals: AbortSignal[] = [];
  const request = jest.fn((_url: string, init: { signal: AbortSignal }) => {
    signals.push(init.signal);
    return Promise.resolve({ ok: true, status: 200, body: { getReader: () => ({
      read: () => new Promise<ReadableStreamReadResult<Uint8Array>>((_resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      }),
      releaseLock: jest.fn(),
    }) } });
  });
  const handlers = createHandlers();
  const subscription = new RemoteArkHostApi(request).subscribe('test-token', handlers);
  await flush();

  expect(handlers.onConnected).toHaveBeenCalledTimes(1);
  await jest.advanceTimersByTimeAsync(60_000);
  await flush();
  expect(signals[0]?.aborted).toBe(true);
  expect(handlers.onDisconnected).toHaveBeenCalledTimes(1);

  await jest.advanceTimersByTimeAsync(5_000);
  await flush();
  expect(request).toHaveBeenCalledTimes(2);
  subscription.unsubscribe();
});

it('cancels pending reconnects on logout', async () => {
  const request = jest.fn(() => Promise.resolve({ ok: false, status: 503, body: null }));
  const handlers = createHandlers();
  new RemoteArkHostApi(request).subscribe('test-token', handlers);
  await flush();
  expect(handlers.onDisconnected).toHaveBeenCalledTimes(1);

  appStore.getState().logout();
  await jest.advanceTimersByTimeAsync(10_000);

  expect(request).toHaveBeenCalledTimes(1);
});

it('logs out on an unauthorized stream without starting fallback recovery', async () => {
  const request = jest.fn(() => Promise.resolve({ ok: false, status: 401, body: null }));
  const handlers = createHandlers();
  new RemoteArkHostApi(request).subscribe('expired-token', handlers);
  await flush();

  expect(appStore.getState().auth.session).toBeNull();
  expect(handlers.onDisconnected).not.toHaveBeenCalled();
  await jest.advanceTimersByTimeAsync(10_000);
  expect(request).toHaveBeenCalledTimes(1);
});
