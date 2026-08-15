import type { AuthFailure } from './api';

type AuthFailureScope = 'login' | 'recovery' | 'account';
type AuthFailureCode = AuthFailure['code'];

const keyByScope: Record<AuthFailureScope, Partial<Record<AuthFailureCode, string>>> = {
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
  login: 'login.errors.fallback',
  recovery: 'recovery.errors.fallback',
  account: 'account.errors.fallback',
};

export function authFailureMessage(
  error: AuthFailure | null,
  translate: (key: string) => string,
  scope: AuthFailureScope,
): string | null {
  if (!error) return null;
  switch (error.code) {
    case 'invalid-credentials':
    case 'account-banned':
    case 'rate-limited':
    case 'network-unavailable':
    case 'timeout':
    case 'server-error':
    case 'invalid-response':
    case 'session-expired':
    case 'user-not-found':
      return translate(keyByScope[scope][error.code] ?? fallbackKeyByScope[scope]);
    case 'already-bound':
    case 'email-already-registered':
    case 'invalid-input':
    case 'invalid-oauth-code':
    case 'invalid-verification-code':
    case 'permission-denied':
    case 'unknown-business-error':
    case 'verification-code-expired':
      return translate(fallbackKeyByScope[scope]);
  }
}
