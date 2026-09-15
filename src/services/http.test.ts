import { fetch } from 'expo/fetch';
import { appStore } from '@/store';
import { mockActiveSession } from '@/mocks/auth';
import { requestJson } from './http';

const mockFetch = jest.fn<Promise<Response>, Parameters<typeof fetch>>();
jest.mock('expo/fetch', () => ({
  fetch: jest.fn((...args: Parameters<typeof fetch>) => mockFetch(...args)),
}));

const REQUEST_TIMEOUT_MS = 15_000;

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockFetch.mockReset();
  appStore.getState().logout();
  mockFetch.mockImplementation((_url, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }));
});

afterEach(() => {
  jest.useRealTimers();
});

it('classifies its own deadline as a timeout', async () => {
  const request = requestJson('https://example.test/data');
  const failure = expect(request).rejects.toMatchObject({ code: 'timeout' });

  jest.advanceTimersByTime(REQUEST_TIMEOUT_MS);

  await failure;
});

it('keeps operation cancellation distinct from a timeout', async () => {
  const controller = new AbortController();
  const request = requestJson('https://example.test/data', { signal: controller.signal });
  const failure = expect(request).rejects.toThrow('Request cancelled');

  controller.abort();

  await failure;
});

it('does not let a late 401 invalidate the next session', async () => {
  let complete: (response: Response) => void = () => { throw new Error('Not started'); };
  mockFetch.mockImplementation(() => new Promise((resolve) => { complete = resolve; }));
  appStore.getState().setSession(mockActiveSession);
  const pending = requestJson('https://example.test/protected', { accessToken: 'old-token' });
  const rejected = expect(pending).rejects.toThrow('cancelled');
  appStore.getState().logout();
  appStore.getState().setSession(mockActiveSession);
  complete(new Response(null, { status: 401 }));
  await rejected;
  expect(appStore.getState().auth.session).toBe(mockActiveSession);
});

it('keeps a timeout during body reading distinct from malformed JSON', async () => {
  mockFetch.mockImplementation((_url, init) => {
    const response = new Response('{}');
    jest.spyOn(response, 'json').mockImplementation(() => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
    }));
    return Promise.resolve(response);
  });
  const outcome = requestJson('https://example.test/data').then(() => null, (error: unknown) => error);
  await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
  expect(await outcome).toMatchObject({ code: 'timeout' });
});
