import type {
  LoginCredentials,
  EmailCodeRequestInput,
  PasswordUpdateInput,
  UserSession,
  RegistrationInput,
  PasswordResetInput,
  LinuxDoLoginInput,
} from '@/schemas/auth';

export type AuthBusinessFailureCode =
  | 'account-banned'
  | 'already-bound'
  | 'email-already-registered'
  | 'invalid-credentials'
  | 'invalid-input'
  | 'invalid-oauth-code'
  | 'invalid-verification-code'
  | 'permission-denied'
  | 'rate-limited'
  | 'session-expired'
  | 'unknown-business-error'
  | 'user-not-found'
  | 'verification-code-expired';

export type AuthAuthorizationFailureCode =
  | 'oauth-unavailable'
  | 'oauth-cancelled'
  | 'oauth-expired'
  | 'oauth-invalid-callback'
  | 'oauth-window-blocked';

export type AuthFailure =
  | { kind: 'authorization'; code: AuthAuthorizationFailureCode }
  | {
    code: AuthBusinessFailureCode;
    diagnosticMessage?: string;
    kind: 'business';
  }
  | {
    code: 'network-unavailable' | 'server-error' | 'timeout';
    diagnosticMessage?: string;
    httpStatus?: number;
    kind: 'transport';
  }
  | {
    code: 'invalid-response';
    diagnosticMessage?: string;
    kind: 'invalid-response';
  };

export type AuthResult<T> =
  | { data: T; ok: true }
  | { error: AuthFailure; ok: false };

/** Expected request failures return AuthResult; signal cancellation rejects. */
export interface AuthAdapter {
  loginWithLinuxDo(input: LinuxDoLoginInput, signal: AbortSignal): Promise<AuthResult<UserSession>>;
  register(input: RegistrationInput, signal: AbortSignal): Promise<AuthResult<UserSession>>;
  resetPassword(input: PasswordResetInput, signal: AbortSignal): Promise<AuthResult<void>>;
  login(input: LoginCredentials, signal: AbortSignal): Promise<AuthResult<UserSession>>;
  requestEmailCode(input: EmailCodeRequestInput, signal: AbortSignal): Promise<AuthResult<void>>;
  updatePassword(input: PasswordUpdateInput, signal: AbortSignal): Promise<AuthResult<void>>;
}
