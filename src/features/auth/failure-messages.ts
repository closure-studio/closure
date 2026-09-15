import type { AuthFailure } from './api';
import { FailureError } from '@/utils/failure-error';

type AuthFailureScope = 'login' | 'recovery' | 'account' | 'enrollment' | 'oauth';

const keyByScope: Record<AuthFailureScope, Readonly<Record<string, string>>> = {
  enrollment: {
    'invalid-verification-code': 'form.errors.invalidCode',
    'verification-code-expired': 'form.errors.expiredCode',
    'email-already-registered': 'form.errors.emailRegistered',
    'rate-limited': 'login.errors.rateLimited',
    'network-unavailable': 'login.errors.networkUnavailable',
    timeout: 'login.errors.networkUnavailable',
  },
  oauth: {
    'oauth-unavailable': 'oauth.unavailable',
    'oauth-cancelled': 'oauth.cancelled',
    'oauth-expired': 'oauth.expired',
    'oauth-invalid-callback': 'oauth.invalidCallback',
    'oauth-window-blocked': 'oauth.windowBlocked',
    'invalid-oauth-code': 'oauth.invalidCallback',
    'invalid-response': 'login.errors.invalidResponse',
    'network-unavailable': 'login.errors.networkUnavailable',
    'rate-limited': 'login.errors.rateLimited',
  },
  login: {
    'invalid-credentials': 'login.errors.invalidCredentials',
    'account-banned': 'login.errors.accountBanned',
    'rate-limited': 'login.errors.rateLimited',
    'network-unavailable': 'login.errors.networkUnavailable',
    timeout: 'login.errors.networkUnavailable',
    'server-error': 'login.errors.serverError',
    'invalid-response': 'login.errors.invalidResponse',
  },
  recovery: {
    'user-not-found': 'recovery.errors.userNotFound',
    'network-unavailable': 'recovery.errors.networkUnavailable',
    timeout: 'recovery.errors.networkUnavailable',
    'server-error': 'recovery.errors.serverError',
    'invalid-response': 'recovery.errors.invalidResponse',
  },
  account: {
    'invalid-credentials': 'account.errors.invalidCredentials',
    'account-banned': 'account.errors.accountBanned',
    'session-expired': 'account.errors.sessionExpired',
    'network-unavailable': 'account.errors.serverError',
    'rate-limited': 'account.errors.serverError',
    timeout: 'account.errors.serverError',
    'server-error': 'account.errors.serverError',
    'invalid-response': 'account.errors.invalidResponse',
  },
};

const fallbackKeyByScope: Record<AuthFailureScope, string> = {
  enrollment: 'registration.failed',
  oauth: 'oauth.failed',
  login: 'login.errors.fallback',
  recovery: 'recovery.errors.fallback',
  account: 'account.errors.fallback',
};

export function authFailureMessage(
  error: AuthFailure | Error | null,
  translate: (key: string) => string,
  scope: AuthFailureScope,
): string | null {
  if (!error) return null;
  const code: unknown = error instanceof FailureError ? error.code : error instanceof Error ? null : error.code;
  const key = typeof code === 'string' ? keyByScope[scope][code] : undefined;
  return translate(key ?? fallbackKeyByScope[scope]);
}
