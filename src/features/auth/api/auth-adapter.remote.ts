import * as v from 'valibot';
import { idServerClaimsSchema, idServerLoginSchema, userSessionSchema, registrationProofSchema } from '@/schemas/auth';
import type { LinuxDoLoginInput, LoginCredentials, EmailCodeRequestInput, PasswordUpdateInput, RegistrationInput, PasswordResetInput, UserSession } from '@/schemas/auth';
import type { QQBindingState } from '@/schemas/user-account';
import { requestJson, HttpFailure } from '@/services/http';
import { assertActive } from '@/services/request-scope';
import { runVerification } from '@/features/verification';
import type { AuthAdapter, AuthResult } from './auth-adapter';

const ID_SERVER_URL = 'https://passport.ltsc.vip/api/v1';

export function decodeSession(data: unknown): UserSession {
  const login = v.parse(idServerLoginSchema, data);
  const payload = login.token.split('.')[1];
  if (!payload) throw new HttpFailure('invalid-response');
  const decoded: unknown = JSON.parse(decodeURIComponent(Array.from(atob(payload.replace(/-/g, '+').replace(/_/g, '/')), (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')));
  const claims = v.parse(idServerClaimsSchema, decoded);
  if (claims.exp * 1000 <= Date.now() || claims.status === 0) throw new HttpFailure('invalid-response');
  return v.parse(userSessionSchema, {
    accessToken: login.token, availableSlots: login.available_slot ?? null,
    expiresAt: new Date(claims.exp * 1000).toISOString(),
    principal: { email: claims.email, id: claims.uuid, permission: claims.permission,
      registeredAt: new Date(claims.createdAt * 1000).toISOString(),
      status: claims.status === -1 ? 'unverified' : claims.status === 2 ? 'manually-verified' : 'active' },
  });
}

export class RemoteAuthAdapter implements AuthAdapter {
  async fetchQQBindingState(accessToken: string, signal: AbortSignal): Promise<AuthResult<QQBindingState>> {
    try {
      const result = await requestJson(`${ID_SERVER_URL}/qq`, {
        accessToken,
        method: 'GET',
        signal,
      });
      if (result.code === 2) {
        return { ok: true, data: {
          status: 'bound',
          verificationCode: null,
        } };
      }
      if (result.code !== 1) {
        return { ok: false, error: {
          kind: 'business',
          diagnosticMessage: result.message,
          code: 'unknown-business-error',
        } };
      }
      const verificationCode = v.parse(v.pipe(v.string(), v.minLength(1)), result.data);
      return { ok: true, data: {
        status: 'unbound',
        verificationCode: `verifyCode:${verificationCode}`,
      } };
    } catch (error) {
      assertActive(signal);
      if (error instanceof HttpFailure && error.code !== 'invalid-response') {
        return { ok: false, error: {
          kind: 'transport',
          code: error.code,
          ...(error.status === undefined ? {} : { httpStatus: error.status }),
        } };
      }
      return { ok: false, error: { kind: 'invalid-response', code: 'invalid-response' } };
    }
  }
  async #call<T>(path: string, body: object, decode: (data: unknown) => T, method: 'POST' | 'PUT', signal: AbortSignal): Promise<AuthResult<T>> {
    try {
      const result = await requestJson(`${ID_SERVER_URL}${path}`, {
        method,
        body,
        signal,
      });
      if (result.code !== 1) return { ok: false, error: { kind: 'business', diagnosticMessage: result.message,
        code: /密码错误|当前密码|用户不存在/.test(result.message) ? 'invalid-credentials'
          : /锁定|频繁/.test(result.message) ? 'rate-limited'
          : /验证码/.test(result.message) ? 'invalid-verification-code' : 'unknown-business-error' } };
      return { ok: true, data: decode(result.data) };
    } catch (error) {
      assertActive(signal);
      if (error instanceof HttpFailure && error.code !== 'invalid-response') return { ok: false, error: { kind: 'transport', code: error.code } };
      return { ok: false, error: { kind: 'invalid-response', code: 'invalid-response' } };
    }
  }
  login(input: LoginCredentials, signal: AbortSignal) {
    return this.#call('/login', { email: input.identifier, password: input.password }, decodeSession, 'POST', signal);
  }
  loginWithLinuxDo(input: LinuxDoLoginInput, signal: AbortSignal) {
    return this.#call('/oauth/linuxdo/exchange', input, decodeSession, 'POST', signal);
  }
  async register(input: RegistrationInput, signal: AbortSignal) {
    const proof = v.parse(registrationProofSchema, await runVerification(
      { kind: 'registration', email: input.email, password: input.password },
      signal,
    ));
    return this.#call('/register', { ...input, ...proof }, decodeSession, 'POST', signal);
  }
  requestEmailCode(input: EmailCodeRequestInput, signal: AbortSignal) {
    return this.#call('/mail/register/code', input, () => undefined, 'POST', signal);
  }
  resetPassword(input: PasswordResetInput, signal: AbortSignal) {
    return this.#call('/forget', {
      code: input.code,
      email: input.email,
      newPasswd: input.password,
    }, () => undefined, 'POST', signal);
  }
  updatePassword(input: PasswordUpdateInput, signal: AbortSignal) {
    return this.#call('/password', { email: input.email, currentPasswd: input.currentPassword, newPasswd: input.newPassword }, () => undefined, 'PUT', signal);
  }
}
