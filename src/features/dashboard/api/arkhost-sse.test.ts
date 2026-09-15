import { TextEncoder } from 'node:util';
import { RemoteArkHostApi } from './arkhost-api.remote';
import { appStore } from '@/store';
import { mockActiveSession } from '@/mocks/auth';
import { mockArkHostGameListResponse } from '@/mocks/arkhost';

const flush = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };
beforeEach(() => { jest.useFakeTimers(); appStore.getState().setSession(mockActiveSession); });
afterEach(() => { appStore.getState().logout(); jest.useRealTimers(); });

it('parses split SSE frames and stops on an explicit close', async () => {
  const data = mockArkHostGameListResponse.code === 1 ? mockArkHostGameListResponse.data : [];
  const stream = `:heartbeat\n\nevent: game\ndata: ${JSON.stringify(data)}\n\nevent: close\ndata: close\n\n`;
  const chunks = [stream.slice(0, 19), stream.slice(19, 67), stream.slice(67)];
  const request = jest.fn(() => Promise.resolve({ ok: true, status: 200, body: { getReader: () => ({
    read: (): Promise<ReadableStreamReadResult<Uint8Array>> => {
      const next = chunks.shift();
      return Promise.resolve(next === undefined ? { done: true, value: undefined } : { done: false, value: new TextEncoder().encode(next) });
    }, releaseLock: jest.fn(),
  }) } }));
  const listener = jest.fn();
  const subscription = new RemoteArkHostApi(request).subscribe('test-token', listener);
  await flush();
  expect(listener).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledWith({ type: 'game', data });
  await jest.advanceTimersByTimeAsync(10000);
  expect(request).toHaveBeenCalledTimes(1);
  subscription.unsubscribe();
});

it('cancels pending reconnects on logout', async () => {
  const request = jest.fn(() => Promise.resolve({ ok: false, status: 503, body: null }));
  new RemoteArkHostApi(request).subscribe('test-token', jest.fn());
  await flush();
  appStore.getState().logout();
  await jest.advanceTimersByTimeAsync(10000);
  expect(request).toHaveBeenCalledTimes(1);
});
