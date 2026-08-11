import * as v from 'valibot';

import { authStateSchema } from './auth-state.schema';

describe('authStateSchema', () => {
  it('accepts authenticated and unauthenticated states', () => {
    expect(v.safeParse(authStateSchema, {
      credentials: null,
      status: 'unauthenticated',
      token: null,
    }).success).toBe(true);
    expect(v.safeParse(authStateSchema, {
      credentials: { password: 'secret', remember: true, username: 'doctor' },
      status: 'authenticated',
      token: 'token',
    }).success).toBe(true);
  });

  it('rejects empty tokens and mismatched credential states', () => {
    expect(v.safeParse(authStateSchema, {
      credentials: { password: 'secret', remember: true, username: 'doctor' },
      status: 'authenticated',
      token: '',
    }).success).toBe(false);
    expect(v.safeParse(authStateSchema, {
      credentials: null,
      status: 'authenticated',
      token: null,
    }).success).toBe(false);
  });
});
