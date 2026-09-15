import type { RequestMode } from '@/schemas/local-state';

jest.mock('expo/fetch', () => ({ fetch: jest.fn() }));

function boot(mode: RequestMode): typeof import('./api') {
  let api: typeof import('./api') | undefined;

  jest.isolateModules(() => {
    const { mmkvStateStorage } = jest.requireActual<typeof import('@/lib/mmkv')>('@/lib/mmkv');
    mmkvStateStorage.setItem('closure.app-store', JSON.stringify({
      version: 0,
      state: { requestMode: mode, auth: { session: null }, selectedApiNodeId: 'domestic' },
    }));
    api = jest.requireActual<typeof import('./api')>('./api');
  });

  if (!api) throw new Error('Expected an initialized API runtime');
  return api;
}

afterEach(() => { jest.clearAllMocks(); });

it.each([
  ['remote', 'RemoteAuthAdapter', 'RemoteArkHostApi', 'RemoteApiNodeAdapter', 'RemoteGameResourcesApi'],
  ['mock', 'MockAuthAdapter', 'MockArkHostApi', 'Object', 'Object'],
] satisfies [RequestMode, string, string, string, string][])('creates the %s API runtime from persisted startup state', (
  mode,
  authAdapter,
  arkHostAdapter,
  apiNodeAdapter,
  gameResourcesAdapter,
) => {
  const api = boot(mode);

  expect(api.authApi.constructor.name).toBe(authAdapter);
  expect(api.arkHostApi.constructor.name).toBe(arkHostAdapter);
  expect(api.apiNodeApi.constructor.name).toBe(apiNodeAdapter);
  expect(api.gameResourcesApi.constructor.name).toBe(gameResourcesAdapter);
});

it('keeps every Mock runtime operation local', async () => {
  const api = boot('mock');
  const { fetch } = jest.requireMock<typeof import('expo/fetch')>('expo/fetch');
  const signal = new AbortController().signal;

  await api.authApi.login({ identifier: 'mock@example.com', password: 'password' }, signal);
  await api.arkHostApi.fetchGameList(signal);
  await api.apiNodeApi.queryNodes(signal);
  await api.gameResourcesApi.fetchCharacter(null, signal);
  await api.gameResourcesApi.fetchItem(null, signal);
  await api.gameResourcesApi.fetchStage(null, signal);
  expect((await api.authorizeLinuxDo(signal, '/dashboard'))?.input.code).toBe('mock-linuxdo');
  expect(() => api.consumeLinuxDoCallback()).toThrow();
  await api.verifyGame({
    kind: 'game',
    account: 'G1',
    captcha: {
      captcha_type: 'none', challenge: 'challenge', created: 0,
      geetestId: '', gt: '', riskType: '',
    },
  }, signal);

  expect(fetch).not.toHaveBeenCalled();
});
