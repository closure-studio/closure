import type {
  LoginCredentials,
  EmailCodeRequestInput,
  PasswordUpdateInput,
  UserSession,
  RegistrationInput,
  PasswordResetInput,
  LinuxDoLoginInput,
} from '@/schemas/auth';
import { assertActive } from '@/services/request-scope';
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
  #registered: { session: UserSession; password: string } | null = null;
  async register(input: RegistrationInput, signal: AbortSignal): Promise<AuthResult<UserSession>> {
    await this.#wait(signal);
    const session = { ...mockActiveSession, principal: { ...mockActiveSession.principal, email: input.email } };
    this.#registered = { session, password: input.password };
    return success(session);
  }
  async resetPassword(_input: PasswordResetInput, signal: AbortSignal): Promise<AuthResult<void>> {
    await this.#wait(signal);
    return success(undefined);
  }
  readonly #delayMs: number;

  constructor(delayMs = MOCK_AUTHENTICATION_DELAY_MS) {
    this.#delayMs = delayMs;
  }

  async #wait(signal: AbortSignal): Promise<void> {
    assertActive(signal);
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve, reject) => {
      const finish = () => {
        signal.removeEventListener('abort', cancel);
        resolve();
      };
      const timer = setTimeout(finish, this.#delayMs);
      const cancel = () => {
        clearTimeout(timer);
        reject(new Error('Request cancelled'));
      };
      signal.addEventListener('abort', cancel, { once: true });
    });
    assertActive(signal);
  }

  async login(_input: LoginCredentials, signal: AbortSignal): Promise<AuthResult<UserSession>> {
    await this.#wait(signal);
    return success(mockActiveSession);
  }
  async loginWithLinuxDo(_input: LinuxDoLoginInput, signal: AbortSignal): Promise<AuthResult<UserSession>> {
    await this.#wait(signal);
    return success(mockActiveSession);
  }

  async requestEmailCode(input: EmailCodeRequestInput, signal: AbortSignal): Promise<AuthResult<void>> {
    await this.#wait(signal);
    return input.email.trim() ? success(undefined) : failure('invalid-input');
  }

  async updatePassword(input: PasswordUpdateInput, signal: AbortSignal): Promise<AuthResult<void>> {
    await this.#wait(signal);
    if (this.#registered?.session.accessToken === input.accessToken && this.#registered.session.principal.email === input.email) {
      if (input.currentPassword !== this.#registered.password) return failure('invalid-credentials');
      this.#registered.password = input.newPassword;
      return success(undefined);
    }
    const session = sessionForToken(input.accessToken);
    if (!session) return failure('session-expired');
    if (session.principal.email !== input.email || input.currentPassword !== MOCK_AUTH_VALUES.password) {
      return failure('invalid-credentials');
    }
    return success(undefined);
  }
}
