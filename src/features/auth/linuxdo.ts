import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import * as v from 'valibot';

import { APP_IDENTITIES } from '@/constants/app-identities';
import { ROUTES } from '@/constants/routes';
import { isPostLoginDestination } from '@/routing/auth-routing';
import type { PostLoginDestination } from '@/routing/auth-routing';
import { linuxDoAuthorizationContextSchema, linuxDoLoginInputSchema } from '@/schemas/auth';
import type { LinuxDoAuthorizationContext, LinuxDoLoginInput } from '@/schemas/auth';
import { FailureError } from '@/utils/failure-error';
import type { AuthAuthorizationFailureCode, AuthFailure } from './api/auth-adapter';

type LinuxDoTarget = 'app' | 'app-dev' | 'web' | 'web-local-expo';
type LinuxDoReturn = { returnUri: string; target: LinuxDoTarget };
type LinuxDoAuthorizationCallback = {
  callbackUrl: string;
  context: LinuxDoAuthorizationContext;
  type: 'callback';
};
type LinuxDoAuthorizationResult = LinuxDoAuthorizationCallback | { type: 'redirected' };
type BrowserResult = Awaited<ReturnType<typeof WebBrowser.openAuthSessionAsync>>;

export type LinuxDoCompletion = {
  input: LinuxDoLoginInput;
  returnTo: PostLoginDestination;
};

export const LINUXDO_PUBLIC_CONFIG = {
  authorizationEndpoint: 'https://connect.linux.do/oauth2/authorize',
  providerCallbackUri: 'https://passport.ltsc.vip/api/v1/oauth/linuxdo/callback',
  responseType: 'code', scope: 'openid profile email',
} as const;

const AUTHORIZATION_TIMEOUT_MS = 10 * 60 * 1000;
const CALLBACK_QUERY_KEYS = new Set(['code', 'error']);
const NATIVE_CALLBACK_PATH = 'oauth/linuxdo';
const VERIFIER_BYTE_LENGTH = 32;
export const LINUXDO_WEB_AUTHORIZATION_KEY = 'linuxdo_authorization';
const WEB_TARGET_BY_ORIGIN = new Map<string, LinuxDoTarget>([
  ['http://localhost:8081', 'web-local-expo'],
  ['https://closure.ltsc.vip', 'web'],
]);
export const linuxDoAvailable = Boolean(process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID?.trim());

function failure(code: AuthAuthorizationFailureCode) {
  return new FailureError({ kind: 'authorization', code } satisfies AuthFailure);
}

export function randomHex(): string {
  return Array.from(Crypto.getRandomBytes(VERIFIER_BYTE_LENGTH), (byte) =>
    byte.toString(16).padStart(2, '0')).join('');
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256, verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 },
  );
  return digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function nativeReturnForScheme(scheme: string, target: LinuxDoTarget): LinuxDoReturn {
  return { returnUri: `${scheme}://${NATIVE_CALLBACK_PATH}`, target };
}

export function getLinuxDoReturn(): LinuxDoReturn {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.isSecureContext) throw failure('oauth-unavailable');
    const target = WEB_TARGET_BY_ORIGIN.get(window.location.origin);
    if (!target) throw failure('oauth-unavailable');
    return { returnUri: new URL(ROUTES.linuxDoCallback, window.location.origin).href, target };
  }
  const returnUri = Linking.createURL(NATIVE_CALLBACK_PATH);
  const production = nativeReturnForScheme(APP_IDENTITIES.production.scheme, 'app');
  if (returnUri === production.returnUri) return production;
  const development = nativeReturnForScheme(APP_IDENTITIES.development.scheme, 'app-dev');
  if (returnUri === development.returnUri) return development;
  throw failure('oauth-unavailable');
}

export function buildLinuxDoAuthorizeUrl(input: {
  clientId: string; codeChallenge: string; target: LinuxDoTarget;
}): string {
  const url = new URL(LINUXDO_PUBLIC_CONFIG.authorizationEndpoint);
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('redirect_uri', LINUXDO_PUBLIC_CONFIG.providerCallbackUri);
  url.searchParams.set('response_type', LINUXDO_PUBLIC_CONFIG.responseType);
  url.searchParams.set('scope', LINUXDO_PUBLIC_CONFIG.scope);
  url.searchParams.set('state', input.target);
  url.searchParams.set('code_challenge', input.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

function callbackMatchesReturnUri(callbackUrl: URL, returnUri: URL): boolean {
  return callbackUrl.protocol === returnUri.protocol
    && callbackUrl.username === returnUri.username
    && callbackUrl.password === returnUri.password
    && callbackUrl.hostname === returnUri.hostname
    && callbackUrl.port === returnUri.port
    && callbackUrl.pathname === returnUri.pathname
    && callbackUrl.hash === '';
}

function parseCallbackCode(callback: string, returnUri: string): string {
  let callbackUrl: URL;
  let expectedReturnUri: URL;
  try {
    callbackUrl = new URL(callback);
    expectedReturnUri = new URL(returnUri);
  } catch {
    throw failure('oauth-invalid-callback');
  }
  if (!callbackMatchesReturnUri(callbackUrl, expectedReturnUri)) throw failure('oauth-invalid-callback');
  let unknownQuery = false;
  callbackUrl.searchParams.forEach((_value, key) => {
    if (!CALLBACK_QUERY_KEYS.has(key)) unknownQuery = true;
  });
  if (unknownQuery) throw failure('oauth-invalid-callback');

  const codes = callbackUrl.searchParams.getAll('code');
  const errors = callbackUrl.searchParams.getAll('error');
  if (codes.length === 1 && errors.length === 0 && codes[0]) return codes[0];
  if (errors.length === 1 && codes.length === 0 && errors[0] === 'access_denied') {
    throw failure('oauth-cancelled');
  }
  throw failure('oauth-invalid-callback');
}

function isBlockedBrowserError(error: unknown): boolean {
  return typeof error === 'object' && error !== null
    && 'code' in error && error.code === 'ERR_WEB_BROWSER_BLOCKED';
}

export async function beginLinuxDoAuthorization(
  signal: AbortSignal,
  returnTo: PostLoginDestination,
): Promise<LinuxDoAuthorizationResult> {
  const clientId = process.env.EXPO_PUBLIC_LINUXDO_CLIENT_ID?.trim();
  if (!clientId) throw failure('oauth-unavailable');
  if (signal.aborted) throw failure('oauth-cancelled');

  const { returnUri, target } = getLinuxDoReturn();
  const context: LinuxDoAuthorizationContext = {
    codeVerifier: randomHex(), expiresAt: Date.now() + AUTHORIZATION_TIMEOUT_MS, returnTo,
  };
  const codeChallenge = await pkceChallenge(context.codeVerifier);
  if (signal.aborted) throw failure('oauth-cancelled');
  const authorizeUrl = buildLinuxDoAuthorizeUrl({ clientId, codeChallenge, target });

  if (Platform.OS === 'web') {
    try {
      window.sessionStorage.setItem(LINUXDO_WEB_AUTHORIZATION_KEY, JSON.stringify(context));
      window.location.assign(authorizeUrl);
    } catch {
      try { window.sessionStorage.removeItem(LINUXDO_WEB_AUTHORIZATION_KEY); } catch { /* unavailable */ }
      throw failure('oauth-unavailable');
    }
    return { type: 'redirected' };
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;
  let cancel: (() => void) | undefined;
  const interrupted = new Promise<BrowserResult>((_resolve, reject) => {
    cancel = () => reject(failure('oauth-cancelled'));
    signal.addEventListener('abort', cancel, { once: true });
    timeout = setTimeout(() => reject(failure('oauth-expired')), AUTHORIZATION_TIMEOUT_MS);
  });
  try {
    const result = await Promise.race([
      WebBrowser.openAuthSessionAsync(authorizeUrl, returnUri), interrupted,
    ]);
    if (signal.aborted) throw failure('oauth-cancelled');
    if (result.type === WebBrowser.WebBrowserResultType.CANCEL
      || result.type === WebBrowser.WebBrowserResultType.DISMISS
      || result.type === WebBrowser.WebBrowserResultType.LOCKED) throw failure('oauth-cancelled');
    if (result.type !== 'success') throw failure('oauth-invalid-callback');
    return { callbackUrl: result.url, context, type: 'callback' };
  } catch (error) {
    if (error instanceof FailureError) throw error;
    if (isBlockedBrowserError(error)) throw failure('oauth-window-blocked');
    throw failure('oauth-unavailable');
  } finally {
    if (timeout) clearTimeout(timeout);
    if (cancel) signal.removeEventListener('abort', cancel);
    try { WebBrowser.dismissAuthSession(); } catch { /* already closed */ }
  }
}

export function watchAbandonedLinuxDoAuthorization(
  report: (code: 'oauth-cancelled' | 'oauth-expired') => void,
): () => void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return () => undefined;
  const check = () => {
    let serialized: string | null = null;
    try {
      serialized = window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY);
      window.sessionStorage.removeItem(LINUXDO_WEB_AUTHORIZATION_KEY);
    } catch { /* unavailable */ }
    if (!serialized) return;
    let decoded: unknown;
    try { decoded = JSON.parse(serialized); } catch { report('oauth-cancelled'); return; }
    const context = v.safeParse(linuxDoAuthorizationContextSchema, decoded);
    report(context.success && Date.now() >= context.output.expiresAt
      ? 'oauth-expired' : 'oauth-cancelled');
  };
  check();
  window.addEventListener('pageshow', check);
  return () => window.removeEventListener('pageshow', check);
}

export function takeLinuxDoWebCallback(): LinuxDoAuthorizationCallback {
  if (Platform.OS !== 'web' || typeof window === 'undefined') throw failure('oauth-invalid-callback');
  let serialized: string | null;
  try {
    serialized = window.sessionStorage.getItem(LINUXDO_WEB_AUTHORIZATION_KEY);
    window.sessionStorage.removeItem(LINUXDO_WEB_AUTHORIZATION_KEY);
  } catch {
    throw failure('oauth-invalid-callback');
  }
  if (!serialized) throw failure('oauth-invalid-callback');
  let decoded: unknown;
  try { decoded = JSON.parse(serialized); } catch { throw failure('oauth-invalid-callback'); }
  const context = v.safeParse(linuxDoAuthorizationContextSchema, decoded);
  if (!context.success) throw failure('oauth-invalid-callback');
  return { callbackUrl: window.location.href, context: context.output, type: 'callback' };
}

export function completeLinuxDoAuthorization(
  authorization: LinuxDoAuthorizationCallback,
): LinuxDoCompletion {
  if (Date.now() >= authorization.context.expiresAt) throw failure('oauth-expired');
  if (!isPostLoginDestination(authorization.context.returnTo)) throw failure('oauth-invalid-callback');
  const input = v.safeParse(linuxDoLoginInputSchema, {
    code: parseCallbackCode(authorization.callbackUrl, getLinuxDoReturn().returnUri),
    code_verifier: authorization.context.codeVerifier,
  });
  if (!input.success) throw failure('oauth-invalid-callback');
  return { input: input.output, returnTo: authorization.context.returnTo };
}
