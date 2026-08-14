import * as v from 'valibot';

import {
  passwordRecoveryRequestInputSchema,
  passwordUpdateInputSchema,
} from './auth-inputs.schema';

const accessToken = 'token';

describe('auth input schemas', () => {
  it.each([
    [passwordUpdateInputSchema, { accessToken, currentPassword: 'current', email: 'user@example.com', newPassword: 'new-secret' }],
    [passwordRecoveryRequestInputSchema, { identifier: ' user@example.com ' }],
  ])('accepts a complete input for schema %#', (schema, input) => {
    expect(v.safeParse(schema, input).success).toBe(true);
  });

  it('rejects malformed common fields', () => {
    expect(v.safeParse(passwordUpdateInputSchema, {
      accessToken: '', currentPassword: '', email: 'not-email', newPassword: '',
    }).success).toBe(false);
    expect(v.safeParse(passwordRecoveryRequestInputSchema, { identifier: '   ' }).success).toBe(false);
  });

  it('trims a password recovery identifier at the input boundary', () => {
    const result = v.safeParse(passwordRecoveryRequestInputSchema, { identifier: ' user@example.com ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.output.identifier).toBe('user@example.com');
  });
});
