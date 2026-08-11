import * as v from 'valibot';

import {
  adminLoginInputSchema,
  adminUserQueryInputSchema,
  linuxDoLoginInputSchema,
  passwordResetInputSchema,
  passwordUpdateInputSchema,
  qqBindCodeInputSchema,
  registrationCodeInputSchema,
  registrationInputSchema,
  sessionRefreshInputSchema,
  userPermissionUpdateInputSchema,
} from './auth-inputs.schema';

const accessToken = 'token';

describe('auth input schemas', () => {
  it.each([
    [registrationInputSchema, { code: '123456', email: 'user@example.com', noise: 'noise', password: 'secret', sign: 'sign' }],
    [passwordResetInputSchema, { code: '123456', email: 'user@example.com', newPassword: 'new-secret' }],
    [passwordUpdateInputSchema, { accessToken, currentPassword: 'current', email: 'user@example.com', newPassword: 'new-secret' }],
    [adminUserQueryInputSchema, { accessToken, query: 'user' }],
    [userPermissionUpdateInputSchema, { accessToken, permission: 3, userId: 'user-1' }],
    [registrationCodeInputSchema, { email: 'user@example.com' }],
    [adminLoginInputSchema, { accessToken, userId: 'user-1' }],
    [sessionRefreshInputSchema, { accessToken }],
    [qqBindCodeInputSchema, { accessToken }],
    [linuxDoLoginInputSchema, { code: 'oauth-code', redirectUri: 'https://example.com/auth/callback' }],
  ])('accepts a complete input for schema %#', (schema, input) => {
    expect(v.safeParse(schema, input).success).toBe(true);
  });

  it('rejects malformed common fields', () => {
    expect(v.safeParse(registrationInputSchema, {
      code: '', email: 'not-email', noise: '', password: '', sign: '',
    }).success).toBe(false);
    expect(v.safeParse(sessionRefreshInputSchema, { accessToken: '' }).success).toBe(false);
    expect(v.safeParse(userPermissionUpdateInputSchema, {
      accessToken, permission: -1, userId: 'user-1',
    }).success).toBe(false);
    expect(v.safeParse(linuxDoLoginInputSchema, {
      code: 'oauth-code', redirectUri: 'relative/path',
    }).success).toBe(false);
  });
});
