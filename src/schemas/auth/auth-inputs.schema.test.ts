import * as v from 'valibot';

import {
  emailCodeRequestInputSchema,
  passwordResetInputSchema,
  passwordUpdateInputSchema,
} from './auth-inputs.schema';

const accessToken = 'token';

describe('auth input schemas', () => {
  it.each([
    [passwordUpdateInputSchema, { accessToken, currentPassword: 'current', email: 'user@example.com', newPassword: 'new-secret' }],
    [emailCodeRequestInputSchema, { email: ' user@example.com ' }],
  ])('accepts a complete input for schema %#', (schema, input) => {
    expect(v.safeParse(schema, input).success).toBe(true);
  });

  it('rejects malformed common fields', () => {
    expect(v.safeParse(passwordUpdateInputSchema, {
      accessToken: '', currentPassword: '', email: 'not-email', newPassword: '',
    }).success).toBe(false);
    expect(v.safeParse(emailCodeRequestInputSchema, { email: '   ' }).success).toBe(false);
  });

  it('uses the public password name for reset input', () => {
    expect(v.parse(passwordResetInputSchema, {
      code: '123456', email: ' user@example.com ', password: 'new-secret',
    })).toEqual({ code: '123456', email: 'user@example.com', password: 'new-secret' });
  });

  it('trims a password recovery email at the input boundary', () => {
    const result = v.safeParse(emailCodeRequestInputSchema, { email: ' user@example.com ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.output.email).toBe('user@example.com');
  });
});
