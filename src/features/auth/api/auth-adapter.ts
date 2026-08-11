import type {
  AdminLoginInput,
  AdminUser,
  AdminUserQueryInput,
  LinuxDoLoginInput,
  LoginCredentials,
  PasswordResetInput,
  PasswordUpdateInput,
  QqBindCodeInput,
  RegistrationCodeInput,
  RegistrationInput,
  SessionRefreshInput,
  UserPermissionUpdateInput,
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
  fetchQqBindCode(input: QqBindCodeInput): Promise<AuthResult<string>>;
  login(input: LoginCredentials): Promise<AuthResult<UserSession>>;
  loginAsAdmin(input: AdminLoginInput): Promise<AuthResult<UserSession>>;
  loginWithLinuxDo(input: LinuxDoLoginInput): Promise<AuthResult<UserSession>>;
  queryUsers(input: AdminUserQueryInput): Promise<AuthResult<AdminUser[]>>;
  refreshSession(input: SessionRefreshInput): Promise<AuthResult<UserSession>>;
  register(input: RegistrationInput): Promise<AuthResult<UserSession>>;
  resetPassword(input: PasswordResetInput): Promise<AuthResult<UserSession>>;
  sendRegistrationCode(input: RegistrationCodeInput): Promise<AuthResult<void>>;
  updatePassword(input: PasswordUpdateInput): Promise<AuthResult<void>>;
  updateUserPermission(input: UserPermissionUpdateInput): Promise<AuthResult<void>>;
}
