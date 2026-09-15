import * as v from 'valibot';

import {
  linuxDoAuthorizationContextSchema,
  linuxDoLoginInputSchema,
  pkceCodeVerifierSchema,
} from './linuxdo.schema';

const verifier = '0123456789abcdef'.repeat(4);

describe('Linux DO schemas', () => {
  it('accepts the first-party 32-byte lowercase hex verifier contract', () => {
    expect(v.safeParse(linuxDoLoginInputSchema, {
      code: 'one-time-code',
      code_verifier: verifier,
    }).success).toBe(true);
  });

  it.each([
    '',
    'a'.repeat(63),
    'a'.repeat(65),
    'A'.repeat(64),
    `${'a'.repeat(63)}!`,
  ])('rejects invalid PKCE verifier %p', (value) => {
    expect(v.safeParse(pkceCodeVerifierSchema, value).success).toBe(false);
  });

  it('validates the bounded cross-document authorization context', () => {
    expect(v.safeParse(linuxDoAuthorizationContextSchema, {
      codeVerifier: verifier,
      expiresAt: Date.now() + 60_000,
      returnTo: '/settings/network',
    }).success).toBe(true);
    expect(v.safeParse(linuxDoAuthorizationContextSchema, {
      codeVerifier: 'invalid', expiresAt: -1, returnTo: '',
    }).success).toBe(false);
  });

  it('does not accept the legacy redirect_uri field instead of a verifier', () => {
    expect(v.safeParse(linuxDoLoginInputSchema, {
      code: 'one-time-code',
      redirect_uri: 'https://closure.ltsc.vip/auth/callback/linuxdo',
    }).success).toBe(false);
  });
});
