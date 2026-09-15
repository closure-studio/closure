import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import {
  LINUXDO_PUBLIC_CONFIG,
  LINUXDO_WEB_AUTHORIZATION_KEY,
  beginLinuxDoAuthorization,
  completeLinuxDoAuthorization,
  getLinuxDoReturn,
  pkceChallenge,
  randomHex,
  takeLinuxDoWebCallback,
  watchAbandonedLinuxDoAuthorization,
} from './linuxdo';

let mockReturnUri = 'com.closurestudio.app.dev://oauth/linuxdo';
let showWebPage: () => void = () => undefined;
const mockAssign = jest.fn<void, [string]>();

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { BASE64: 'base64' },
  digestStringAsync: jest.fn(),
  getRandomBytes: jest.fn(),
}));
jest.mock('expo-linking', () => ({ createURL: jest.fn() }));
jest.mock('expo-web-browser', () => ({
  WebBrowserResultType: {
    CANCEL: 'cancel',
    DISMISS: 'dismiss',
    LOCKED: 'locked',
    OPENED: 'opened',
  },
  dismissAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

const originalClientId = process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID;
const originalPlatform = Platform.OS;
const verifier = Array.from({ length: 32 }, (_value, index) =>
  index.toString(16).padStart(2, '0'),
).join('');

function setPlatform(os: typeof Platform.OS): void {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
}

function setWebLocation(origin: string, href = `${origin}/login`): void {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { assign: mockAssign, href, origin },
  });
  Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
  Object.defineProperty(window, 'addEventListener', {
    configurable: true,
    value: (_type: string, listener: () => void) => { showWebPage = listener; },
  });
  Object.defineProperty(window, 'removeEventListener', {
    configurable: true,
    value: () => undefined,
  });
}

function storeWebContext(
  overrides: Partial<{ codeVerifier: string; expiresAt: number; returnTo: string }> = {},
): void {
  window.sessionStorage.setItem(LINUXDO_WEB_AUTHORIZATION_KEY, JSON.stringify({
    codeVerifier: verifier,
    expiresAt: Date.now() + 60_000,
    returnTo: '/settings/network',
    ...overrides,
  }));
}

beforeEach(() => {
  jest.clearAllMocks();
  window.sessionStorage.clear();
  jest.useRealTimers();
  process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID = 'test-public-client';
  mockReturnUri = 'com.closurestudio.app.dev://oauth/linuxdo';
  showWebPage = () => undefined;
  jest.mocked(Linking.createURL).mockImplementation(() => mockReturnUri);
  jest.mocked(Crypto.getRandomBytes).mockReturnValue(
    Uint8Array.from({ length: 32 }, (_value, index) => index),
  );
  jest.mocked(Crypto.digestStringAsync).mockResolvedValue('challenge+/==');
  setPlatform('ios');
});

afterAll(() => {
  setPlatform(originalPlatform);
  if (originalClientId === undefined) delete process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID;
  else process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID = originalClientId;
});

it('uses Linux DO directly with the fixed passport callback', () => {
  expect(LINUXDO_PUBLIC_CONFIG).toEqual({
    authorizationEndpoint: 'https://connect.linux.do/oauth2/authorize',
    providerCallbackUri: 'https://passport.ltsc.vip/api/v1/oauth/linuxdo/callback',
    responseType: 'code',
    scope: 'openid profile email',
  });
});

it('derives only the fixed native targets from the configured app schemes', () => {
  expect(getLinuxDoReturn()).toEqual({
    returnUri: 'com.closurestudio.app.dev://oauth/linuxdo',
    target: 'app-dev',
  });
  mockReturnUri = 'com.closurestudio.app://oauth/linuxdo';
  expect(getLinuxDoReturn()).toEqual({
    returnUri: 'com.closurestudio.app://oauth/linuxdo',
    target: 'app',
  });
  mockReturnUri = 'exp://127.0.0.1:8081/--/oauth/linuxdo';
  expect(() => getLinuxDoReturn()).toThrow('Request failed (oauth-unavailable)');
});

it.each([
  ['http://localhost:8081', 'web-local-expo'],
  ['https://closure.ltsc.vip', 'web'],
] as const)('maps the fixed Web origin %s to %s', (origin, target) => {
  setPlatform('web');
  setWebLocation(origin);
  expect(getLinuxDoReturn()).toEqual({
    returnUri: `${origin}/auth/callback/linuxdo`,
    target,
  });
});

it('rejects arbitrary Web origins', () => {
  setPlatform('web');
  setWebLocation('https://attacker.example');
  expect(() => getLinuxDoReturn()).toThrow('Request failed (oauth-unavailable)');
});

it('creates a 32-byte lowercase hex verifier and an S256 base64url challenge', async () => {
  expect(randomHex()).toBe(verifier);
  await expect(pkceChallenge(verifier)).resolves.toBe('challenge-_');
  expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
});

it('begins Web authorization with a same-tab redirect and a bounded context', async () => {
  setPlatform('web');
  setWebLocation('http://localhost:8081');
  const before = Date.now();

  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/settings/network',
  )).resolves.toEqual({ type: 'redirected' });

  const assignedUrl = mockAssign.mock.calls[0]?.[0];
  expect(typeof assignedUrl).toBe('string');
  const parsed = new URL(String(assignedUrl));
  expect(parsed.origin + parsed.pathname).toBe('https://connect.linux.do/oauth2/authorize');
  expect(parsed.searchParams.get('state')).toBe('web-local-expo');
  const stored: unknown = JSON.parse(String(
    window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY),
  ));
  if (typeof stored !== 'object' || stored === null || !('expiresAt' in stored)
    || typeof stored.expiresAt !== 'number') throw new Error('Expected an authorization expiry');
  expect(stored).toEqual({
    codeVerifier: verifier,
    expiresAt: stored.expiresAt,
    returnTo: '/settings/network',
  });
  expect(stored.expiresAt).toBeGreaterThanOrEqual(before + 10 * 60 * 1000);
  expect(WebBrowser.openAuthSessionAsync).not.toHaveBeenCalled();
});

it('completes Web authorization once and preserves its validated return target', () => {
  setPlatform('web');
  setWebLocation(
    'http://localhost:8081',
    'http://localhost:8081/auth/callback/linuxdo?code=one-time-code',
  );
  storeWebContext();

  expect(completeLinuxDoAuthorization(takeLinuxDoWebCallback())).toEqual({
    input: { code: 'one-time-code', code_verifier: verifier },
    returnTo: '/settings/network',
  });
  expect(window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY)).toBeNull();
  expect(() => takeLinuxDoWebCallback()).toThrow('Request failed (oauth-invalid-callback)');
});

it.each([
  'http://localhost:8081/auth/callback/linuxdo?error=access_denied',
  'http://localhost:8081/auth/callback/linuxdo?code=one&state=web-local-expo',
  'http://localhost:8081/login?code=one',
] as const)('destroys the Web context after invalid callback %s', (href) => {
  setPlatform('web');
  setWebLocation('http://localhost:8081', href);
  storeWebContext();

  expect(() => completeLinuxDoAuthorization(takeLinuxDoWebCallback())).toThrow();
  expect(window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY)).toBeNull();
});

it('reports a Web authorization abandoned through reload or browser back', () => {
  setPlatform('web');
  setWebLocation('http://localhost:8081');
  const report = jest.fn<void, ['oauth-cancelled' | 'oauth-expired']>();
  storeWebContext();

  const dispose = watchAbandonedLinuxDoAuthorization(report);
  expect(report).toHaveBeenLastCalledWith('oauth-cancelled');
  expect(window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY)).toBeNull();

  storeWebContext({ expiresAt: Date.now() - 1 });
  showWebPage();
  expect(report).toHaveBeenLastCalledWith('oauth-expired');
  dispose();
});

it('rejects expired or tampered Web authorization contexts after consuming them', () => {
  setPlatform('web');
  setWebLocation(
    'http://localhost:8081',
    'http://localhost:8081/auth/callback/linuxdo?code=one-time-code',
  );
  storeWebContext({ expiresAt: Date.now() - 1 });
  expect(() => completeLinuxDoAuthorization(takeLinuxDoWebCallback())).toThrow(
    'Request failed (oauth-expired)',
  );

  storeWebContext({ returnTo: 'https://attacker.example' });
  expect(() => completeLinuxDoAuthorization(takeLinuxDoWebCallback())).toThrow(
    'Request failed (oauth-invalid-callback)',
  );
  expect(window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY)).toBeNull();
});

it('uses the same complete step for a native callback', async () => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
    type: 'success',
    url: 'com.closurestudio.app.dev://oauth/linuxdo?code=one-time-code',
  });

  const authorization = await beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard/operators',
  );
  if (authorization.type !== 'callback') throw new Error('Expected a native callback');
  expect(completeLinuxDoAuthorization(authorization)).toEqual({
    input: { code: 'one-time-code', code_verifier: verifier },
    returnTo: '/dashboard/operators',
  });
  const browserCall = jest.mocked(WebBrowser.openAuthSessionAsync).mock.calls[0];
  if (!browserCall) throw new Error('Expected the authorization browser to open');
  const [authorizeUrl, returnUri] = browserCall;
  const parsed = new URL(authorizeUrl);
  expect(Object.fromEntries(parsed.searchParams)).toEqual({
    client_id: 'test-public-client',
    redirect_uri: 'https://passport.ltsc.vip/api/v1/oauth/linuxdo/callback',
    response_type: 'code',
    scope: 'openid profile email',
    state: 'app-dev',
    code_challenge: 'challenge-_',
    code_challenge_method: 'S256',
  });
  expect(returnUri).toBe('com.closurestudio.app.dev://oauth/linuxdo');
  expect(WebBrowser.dismissAuthSession).toHaveBeenCalledTimes(1);
});

it.each([
  WebBrowser.WebBrowserResultType.CANCEL,
  WebBrowser.WebBrowserResultType.DISMISS,
  WebBrowser.WebBrowserResultType.LOCKED,
])('maps %s to cancellation', async (type) => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type });
  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  )).rejects.toMatchObject({ code: 'oauth-cancelled' });
});

it('rejects browser results that are neither a callback nor cancellation', async () => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
    type: WebBrowser.WebBrowserResultType.OPENED,
  });
  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  )).rejects.toMatchObject({ code: 'oauth-invalid-callback' });
});

it.each([
  ['com.closurestudio.app.dev://oauth/linuxdo?error=access_denied', 'oauth-cancelled'],
  ['com.closurestudio.app.dev://oauth/linuxdo?error=oauth_failed', 'oauth-invalid-callback'],
  ['com.closurestudio.app.dev://oauth/linuxdo', 'oauth-invalid-callback'],
  ['com.closurestudio.app.dev://oauth/linuxdo?code=', 'oauth-invalid-callback'],
  ['com.closurestudio.app.dev://oauth/linuxdo?code=one&code=two', 'oauth-invalid-callback'],
  ['com.closurestudio.app.dev://oauth/linuxdo?code=one&state=app-dev', 'oauth-invalid-callback'],
  ['com.closurestudio.app://oauth/linuxdo?code=one', 'oauth-invalid-callback'],
] as const)('validates controlled callback %s during completion', async (url, code) => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({ type: 'success', url });
  const authorization = await beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  );
  if (authorization.type !== 'callback') throw new Error('Expected a native callback');
  expect(() => completeLinuxDoAuthorization(authorization)).toThrow(
    `Request failed (${code})`,
  );
});

it('preserves AbortSignal cancellation and ignores a late browser result', async () => {
  let finish: () => void = () => undefined;
  let markOpened: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => {
    markOpened = resolve;
  });
  jest.mocked(WebBrowser.openAuthSessionAsync).mockImplementation(() => new Promise((resolve) => {
    markOpened();
    finish = () => resolve({
      type: 'success',
      url: 'com.closurestudio.app.dev://oauth/linuxdo?code=late-code',
    });
  }));
  const controller = new AbortController();
  const authorization = beginLinuxDoAuthorization(controller.signal, '/dashboard');
  const rejected = expect(authorization).rejects.toMatchObject({ code: 'oauth-cancelled' });
  await opened;
  controller.abort();
  await rejected;
  finish();
  expect(WebBrowser.dismissAuthSession).toHaveBeenCalledTimes(1);
});

it('times out after ten minutes and closes the browser session', async () => {
  jest.useFakeTimers();
  let markOpened: () => void = () => undefined;
  const opened = new Promise<void>((resolve) => {
    markOpened = resolve;
  });
  jest.mocked(WebBrowser.openAuthSessionAsync).mockImplementation(() => {
    markOpened();
    return new Promise(() => undefined);
  });
  const authorization = beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  );
  const rejected = expect(authorization).rejects.toMatchObject({ code: 'oauth-expired' });
  await opened;
  jest.advanceTimersByTime(10 * 60 * 1000);
  await rejected;
  expect(WebBrowser.dismissAuthSession).toHaveBeenCalledTimes(1);
});

it('maps blocked browser errors and unavailable configuration', async () => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockRejectedValue(
    Object.assign(new Error('blocked'), { code: 'ERR_WEB_BROWSER_BLOCKED' }),
  );
  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  )).rejects.toMatchObject({ code: 'oauth-window-blocked' });

  delete process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID;
  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  )).rejects.toMatchObject({ code: 'oauth-unavailable' });
});

it('does not replace a successful handoff when browser cleanup is unavailable', async () => {
  jest.mocked(WebBrowser.openAuthSessionAsync).mockResolvedValue({
    type: 'success',
    url: 'com.closurestudio.app.dev://oauth/linuxdo?code=one-time-code',
  });
  jest.mocked(WebBrowser.dismissAuthSession).mockImplementation(() => {
    throw new Error('dismiss unavailable');
  });

  await expect(beginLinuxDoAuthorization(
    new AbortController().signal,
    '/dashboard',
  )).resolves.toMatchObject({ type: 'callback' });
});
