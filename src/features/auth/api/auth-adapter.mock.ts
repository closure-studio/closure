import type {
  LoginCredentials,
  PasswordRecoveryRequestInput,
  PasswordUpdateInput,
  UserSession,
} from '@/schemas/auth';
import type { AuthAdapter, AuthBusinessFailureCode, AuthResult } from './auth-adapter';
import {
  MOCK_AUTH_VALUES,
  mockActiveSession,
  mockAdminSession,
  mockBannedSession,
} from '@/mocks/auth';

const MOCK_AUTHENTICATION_DELAY_MS = 1_100;

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

  async login(_input: LoginCredentials): Promise<AuthResult<UserSession>> {
    await this.#wait();
    return success(mockActiveSession);
  }

  async requestPasswordRecovery(input: PasswordRecoveryRequestInput): Promise<AuthResult<void>> {
    await this.#wait();
    const identifier = input.identifier.toLocaleLowerCase();
    const knownUser = [mockActiveSession, mockAdminSession, mockBannedSession]
      .some((session) => (
        session.principal.email.toLocaleLowerCase() === identifier
        || session.principal.id.toLocaleLowerCase() === identifier
      ));
    return knownUser ? success(undefined) : failure('user-not-found');
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
}
