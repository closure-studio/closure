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
import { USER_PERMISSION } from '@/schemas/auth';
import type { AuthAdapter, AuthBusinessFailureCode, AuthResult } from './auth-adapter';
import {
  MOCK_AUTH_VALUES,
  mockActiveSession,
  mockAdminSession,
  mockAdminUsers,
  mockBannedSession,
} from './mock-auth-fixtures';

export const MOCK_AUTHENTICATION_DELAY_MS = 1_100;

function success<T>(data: T): AuthResult<T> {
  return { data, ok: true };
}

function failure<T>(code: AuthBusinessFailureCode): AuthResult<T> {
  return { error: { code, kind: 'business' }, ok: false };
}

function sessionForToken(accessToken: string): UserSession | null {
  return [mockActiveSession, mockAdminSession, mockBannedSession]
    .find((session) => session.accessToken === accessToken) ?? null;
}

function sessionForUserId(userId: string): UserSession | null {
  return [mockActiveSession, mockAdminSession, mockBannedSession]
    .find((session) => session.principal.id === userId) ?? null;
}

function hasAdminPermission(accessToken: string): boolean {
  const permission = sessionForToken(accessToken)?.principal.permission ?? 0;
  return (permission & USER_PERMISSION.superAdmin) === USER_PERMISSION.superAdmin;
}

export class MockAuthAdapter implements AuthAdapter {
  readonly #delayMs: number;

  constructor(delayMs = MOCK_AUTHENTICATION_DELAY_MS) {
    this.#delayMs = delayMs;
  }

  async #wait(): Promise<void> {
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, this.#delayMs);
    });
  }

  async fetchQqBindCode(input: QqBindCodeInput): Promise<AuthResult<string>> {
    await this.#wait();
    const session = sessionForToken(input.accessToken);
    if (!session) return failure('session-expired');
    if (session.principal.id === mockAdminSession.principal.id) return failure('already-bound');
    return success(MOCK_AUTH_VALUES.qqBindCode);
  }

  async login(input: LoginCredentials): Promise<AuthResult<UserSession>> {
    await this.#wait();
    return success(mockActiveSession);
  }

  async loginAsAdmin(input: AdminLoginInput): Promise<AuthResult<UserSession>> {
    await this.#wait();
    if (!hasAdminPermission(input.accessToken)) return failure('permission-denied');
    const session = sessionForUserId(input.userId);
    return session ? success(session) : failure('user-not-found');
  }

  async loginWithLinuxDo(input: LinuxDoLoginInput): Promise<AuthResult<UserSession>> {
    await this.#wait();
    return input.code === MOCK_AUTH_VALUES.linuxDoCode
      ? success(mockActiveSession)
      : failure('invalid-oauth-code');
  }

  async queryUsers(input: AdminUserQueryInput): Promise<AuthResult<AdminUser[]>> {
    await this.#wait();
    if (!hasAdminPermission(input.accessToken)) return failure('permission-denied');
    const query = input.query.toLocaleLowerCase();
    return success(mockAdminUsers.filter((user) => (
      user.email.toLocaleLowerCase().includes(query) || user.id.toLocaleLowerCase().includes(query)
    )));
  }

  async refreshSession(input: SessionRefreshInput): Promise<AuthResult<UserSession>> {
    await this.#wait();
    const session = sessionForToken(input.accessToken);
    return session ? success(session) : failure('session-expired');
  }

  async register(input: RegistrationInput): Promise<AuthResult<UserSession>> {
    await this.#wait();
    const existingSession = [mockActiveSession, mockAdminSession, mockBannedSession]
      .some((session) => session.principal.email === input.email);
    if (existingSession) return failure('email-already-registered');
    if (input.code !== MOCK_AUTH_VALUES.registrationCode) return failure('invalid-verification-code');

    return success({
      ...mockActiveSession,
      accessToken: 'mock-registered-session-token',
      principal: {
        ...mockActiveSession.principal,
        email: input.email,
        id: 'user-closure-registered',
      },
    });
  }

  async resetPassword(input: PasswordResetInput): Promise<AuthResult<UserSession>> {
    await this.#wait();
    if (input.code !== MOCK_AUTH_VALUES.registrationCode) return failure('invalid-verification-code');
    const session = [mockActiveSession, mockAdminSession, mockBannedSession]
      .find((candidate) => candidate.principal.email === input.email);
    return session ? success(session) : failure('user-not-found');
  }

  async sendRegistrationCode(input: RegistrationCodeInput): Promise<AuthResult<void>> {
    await this.#wait();
    const emailExists = [mockActiveSession, mockAdminSession, mockBannedSession]
      .some((session) => session.principal.email === input.email);
    return emailExists ? failure('email-already-registered') : success(undefined);
  }

  async updatePassword(input: PasswordUpdateInput): Promise<AuthResult<void>> {
    await this.#wait();
    const session = sessionForToken(input.accessToken);
    if (!session) return failure('session-expired');
    if (session.principal.email !== input.email || input.currentPassword !== MOCK_AUTH_VALUES.password) {
      return failure('invalid-credentials');
    }
    return success(undefined);
  }

  async updateUserPermission(input: UserPermissionUpdateInput): Promise<AuthResult<void>> {
    await this.#wait();
    if (!hasAdminPermission(input.accessToken)) return failure('permission-denied');
    const userExists = mockAdminUsers.some((user) => user.id === input.userId);
    return userExists ? success(undefined) : failure('user-not-found');
  }
}
