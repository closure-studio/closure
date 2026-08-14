import * as v from 'valibot';

import { userSessionSchema } from '@/schemas/auth';
import { MOCK_AUTH_VALUES, mockActiveSession } from '@/mocks/auth';
import { MockAuthAdapter } from './auth-adapter.mock';

const adapter = new MockAuthAdapter(0);

function expectSuccess<T>(result: { data: T; ok: true } | { error: unknown; ok: false }): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error('Expected mock auth operation to succeed.');
  return result.data;
}

describe('MockAuthAdapter', () => {
  it('implements every auth operation with deterministic successful data', async () => {
    const login = expectSuccess(await adapter.login({
      identifier: 'any-user',
      password: 'any-password',
    }));
    expectSuccess(await adapter.updatePassword({
      accessToken: MOCK_AUTH_VALUES.activeToken,
      currentPassword: MOCK_AUTH_VALUES.password,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    }));
    expectSuccess(await adapter.requestPasswordRecovery({ identifier: MOCK_AUTH_VALUES.activeEmail }));

    expect(v.safeParse(userSessionSchema, login).success).toBe(true);
  });

  it('accepts any credential string and password for mock login', async () => {
    const result = expectSuccess(await adapter.login({
      identifier: 'another-user',
      password: 'anything-at-all',
    }));

    expect(result).toEqual(mockActiveSession);
  });

  it('distinguishes session and unknown-user failures', async () => {
    await expect(adapter.updatePassword({
      accessToken: 'expired',
      currentPassword: MOCK_AUTH_VALUES.password,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    })).resolves.toEqual({ error: { code: 'session-expired', kind: 'business' }, ok: false });
    await expect(adapter.requestPasswordRecovery({ identifier: 'unknown@example.com' }))
      .resolves.toEqual({ error: { code: 'user-not-found', kind: 'business' }, ok: false });
  });
});
