import * as v from 'valibot';

import { loginCredentialsSchema, loginSubmissionSchema } from './login-credentials.schema';

describe('loginCredentialsSchema', () => {
  it('accepts any credential and normalizes the identifier', () => {
    const result = v.safeParse(loginCredentialsSchema, {
      identifier: '  doctor  ',
      password: ' access-key ',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output).toEqual({
        identifier: 'doctor',
        password: ' access-key ',
      });
    }
  });

  it.each([
    { identifier: '', password: 'access-key' },
    { identifier: '   ', password: 'access-key' },
    { identifier: 'doctor', password: '' },
    { identifier: 'doctor', password: '   ' },
  ])('rejects blank credential fields', (credentials) => {
    expect(v.safeParse(loginCredentialsSchema, credentials).success).toBe(false);
  });

  it('accepts a login submission with credentials only', () => {
    const result = v.parse(loginSubmissionSchema, {
      credentials: { identifier: 'doctor', password: 'access-key' },
    });

    expect(result).toEqual({
      credentials: { identifier: 'doctor', password: 'access-key' },
    });
  });
});
