import * as v from 'valibot';

import { loginCredentialsSchema } from './login-credentials.schema';

describe('loginCredentialsSchema', () => {
  it('accepts credentials and normalizes the username', () => {
    const result = v.safeParse(loginCredentialsSchema, {
      password: ' access-key ',
      remember: true,
      username: '  doctor@rhodes.is  ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toEqual({
        password: ' access-key ',
        remember: true,
        username: 'doctor@rhodes.is',
      });
    }
  });

  it.each([
    { password: 'access-key', remember: true, username: '' },
    { password: 'access-key', remember: true, username: '   ' },
    { password: '', remember: true, username: 'doctor' },
    { password: '   ', remember: true, username: 'doctor' },
  ])('rejects blank credential fields', (credentials) => {
    expect(v.safeParse(loginCredentialsSchema, credentials).success).toBe(false);
  });
});
