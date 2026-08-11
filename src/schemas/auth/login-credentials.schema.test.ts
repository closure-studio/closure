import * as v from 'valibot';

import { loginCredentialsSchema, loginSubmissionSchema } from './login-credentials.schema';

describe('loginCredentialsSchema', () => {
  it('accepts credentials and normalizes the email', () => {
    const result = v.safeParse(loginCredentialsSchema, {
      email: '  doctor@rhodes.is  ',
      password: ' access-key ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toEqual({
        email: 'doctor@rhodes.is',
        password: ' access-key ',
      });
    }
  });

  it.each([
    { email: '', password: 'access-key' },
    { email: 'doctor', password: 'access-key' },
    { email: 'doctor@rhodes.is', password: '' },
    { email: 'doctor@rhodes.is', password: '   ' },
  ])('rejects blank credential fields', (credentials) => {
    expect(v.safeParse(loginCredentialsSchema, credentials).success).toBe(false);
  });

  it('keeps the persistence preference outside credentials', () => {
    const result = v.parse(loginSubmissionSchema, {
      credentials: { email: 'doctor@rhodes.is', password: 'access-key' },
      rememberSession: false,
    });

    expect(result.rememberSession).toBe(false);
    expect(result.credentials).not.toHaveProperty('rememberSession');
  });
});
