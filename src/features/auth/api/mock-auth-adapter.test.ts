import * as v from 'valibot';

import { adminUserSchema, userSessionSchema } from '@/schemas/auth';
import { MOCK_AUTH_VALUES, mockActiveSession, mockAdminSession } from './mock-auth-fixtures';
import { MockAuthAdapter } from './mock-auth-adapter';

const adapter = new MockAuthAdapter(0);

function expectSuccess<T>(result: { data: T; ok: true } | { error: unknown; ok: false }): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected mock auth operation to succeed.');
  return result.data;
}

describe('MockAuthAdapter', () => {
  it('implements every auth operation with deterministic successful data', async () => {
    const login = expectSuccess(await adapter.login({
      email: 'any-user@example.com',
      password: 'any-password',
    }));
    const registration = expectSuccess(await adapter.register({
      code: MOCK_AUTH_VALUES.registrationCode,
      email: 'new-user@example.com',
      noise: 'noise',
      password: 'new-password',
      sign: 'signature',
    }));
    const reset = expectSuccess(await adapter.resetPassword({
      code: MOCK_AUTH_VALUES.registrationCode,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    }));
    expectSuccess(await adapter.updatePassword({
      accessToken: MOCK_AUTH_VALUES.activeToken,
      currentPassword: MOCK_AUTH_VALUES.password,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    }));
    const queriedUsers = expectSuccess(await adapter.queryUsers({
      accessToken: MOCK_AUTH_VALUES.adminToken,
      query: 'doctor',
    }));
    expectSuccess(await adapter.updateUserPermission({
      accessToken: MOCK_AUTH_VALUES.adminToken,
      permission: 1,
      userId: mockActiveSession.principal.id,
    }));
    expectSuccess(await adapter.sendRegistrationCode({ email: 'new-user@example.com' }));
    const adminLogin = expectSuccess(await adapter.loginAsAdmin({
      accessToken: MOCK_AUTH_VALUES.adminToken,
      userId: mockActiveSession.principal.id,
    }));
    const refreshed = expectSuccess(await adapter.refreshSession({
      accessToken: MOCK_AUTH_VALUES.activeToken,
    }));
    const qqCode = expectSuccess(await adapter.fetchQqBindCode({
      accessToken: MOCK_AUTH_VALUES.activeToken,
    }));
    const oauthLogin = expectSuccess(await adapter.loginWithLinuxDo({
      code: MOCK_AUTH_VALUES.linuxDoCode,
      redirectUri: 'https://example.com/auth/callback',
    }));

    expect(v.safeParse(userSessionSchema, login).success).toBe(true);
    expect(v.safeParse(userSessionSchema, registration).success).toBe(true);
    expect(reset).toEqual(mockActiveSession);
    expect(queriedUsers).toHaveLength(1);
    expect(v.safeParse(adminUserSchema, queriedUsers[0]).success).toBe(true);
    expect(adminLogin).toEqual(mockActiveSession);
    expect(refreshed).toEqual(mockActiveSession);
    expect(qqCode).toBe(MOCK_AUTH_VALUES.qqBindCode);
    expect(oauthLogin).toEqual(mockActiveSession);
  });

  it('accepts any valid email and password for mock login', async () => {
    const result = expectSuccess(await adapter.login({
      email: 'another-user@example.com',
      password: 'anything-at-all',
    }));

    expect(result).toEqual(mockActiveSession);
  });

  it('distinguishes authorization, session, binding, and OAuth failures', async () => {
    await expect(adapter.queryUsers({
      accessToken: MOCK_AUTH_VALUES.activeToken,
      query: 'doctor',
    })).resolves.toEqual({ error: { code: 'permission-denied', kind: 'business' }, ok: false });
    await expect(adapter.refreshSession({ accessToken: 'expired' }))
      .resolves.toEqual({ error: { code: 'session-expired', kind: 'business' }, ok: false });
    await expect(adapter.fetchQqBindCode({ accessToken: mockAdminSession.accessToken }))
      .resolves.toEqual({ error: { code: 'already-bound', kind: 'business' }, ok: false });
    await expect(adapter.loginWithLinuxDo({
      code: 'incorrect',
      redirectUri: 'https://example.com/auth/callback',
    })).resolves.toEqual({ error: { code: 'invalid-oauth-code', kind: 'business' }, ok: false });
  });
});
