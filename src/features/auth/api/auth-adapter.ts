import type {
  LoginCredentials,
  PasswordRecoveryRequestInput,
  PasswordUpdateInput,
  UserSession,
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

export type AuthFailure =
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

export interface AuthAdapter {
  login(input: LoginCredentials): Promise<AuthResult<UserSession>>;
  requestPasswordRecovery(input: PasswordRecoveryRequestInput): Promise<AuthResult<void>>;
  updatePassword(input: PasswordUpdateInput): Promise<AuthResult<void>>;
}
