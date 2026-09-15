import * as v from 'valibot';

import { userSessionSchema } from '@/schemas/auth';
import { MOCK_AUTH_VALUES, mockActiveSession } from '@/mocks/auth';
import { MockAuthAdapter } from './auth-adapter.mock';

const adapter = new MockAuthAdapter(0);
const signal = () => new AbortController().signal;

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
    }, signal()));
    expectSuccess(await adapter.updatePassword({
      accessToken: MOCK_AUTH_VALUES.activeToken,
      currentPassword: MOCK_AUTH_VALUES.password,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    }, signal()));
    expectSuccess(await adapter.requestEmailCode({ email: MOCK_AUTH_VALUES.activeEmail }, signal()));

    expect(v.safeParse(userSessionSchema, login).success).toBe(true);
  });

  it('accepts any credential string and password for mock login', async () => {
    const result = expectSuccess(await adapter.login({
      identifier: 'another-user',
      password: 'anything-at-all',
    }, signal()));

    expect(result).toEqual(mockActiveSession);
  });

  it('rejects cancellation instead of returning a business failure', async () => {
    const delayedAdapter = new MockAuthAdapter(1_000);
    const controller = new AbortController();
    const login = delayedAdapter.login({
      identifier: 'any-user',
      password: 'any-password',
    }, controller.signal);

    controller.abort();

    await expect(login).rejects.toThrow('Request cancelled');
  });

  it('rejects expired sessions and allows sending a code before registration', async () => {
    await expect(adapter.updatePassword({
      accessToken: 'expired',
      currentPassword: MOCK_AUTH_VALUES.password,
      email: MOCK_AUTH_VALUES.activeEmail,
      newPassword: 'new-password',
    }, signal())).resolves.toEqual({ error: { code: 'session-expired', kind: 'business' }, ok: false });
    await expect(adapter.requestEmailCode({ email: 'unknown@example.com' }, signal()))
      .resolves.toEqual({ data: undefined, ok: true });
  });
});
