import * as v from 'valibot';

import {
  passwordChangeInputSchema,
  passwordChangeIssue,
  userAccountSchema,
} from './user-account.schema';

const validUserAccount = {
  id: 'user-closure-01',
  email: 'doctor@rhodes.is',
  registeredAt: '2025-01-14T08:30:00.000Z',
  role: 'member',
} as const;

describe('userAccountSchema', () => {
  it('accepts a complete User Account', () => {
    expect(v.safeParse(userAccountSchema, validUserAccount).success).toBe(true);
  });

  it.each([
    { ...validUserAccount, id: '' },
    { ...validUserAccount, email: 'doctor' },
    { ...validUserAccount, registeredAt: '14 January 2025' },
    { ...validUserAccount, role: 'operator' },
  ])('rejects malformed User Account data', (input) => {
    expect(v.safeParse(userAccountSchema, input).success).toBe(false);
  });
});

describe('passwordChangeInputSchema', () => {
  it('accepts matching passwords without changing their content', () => {
    const input = {
      currentPassword: '  current key  ',
      newPassword: '  new key  ',
      repeatNewPassword: '  new key  ',
    };
    const result = v.safeParse(passwordChangeInputSchema, input);

    expect(result.success).toBe(true);
    if (result.success) expect(result.output).toEqual(input);
  });

  it.each([
    ['currentPassword', { currentPassword: '', newPassword: 'new', repeatNewPassword: 'new' }, passwordChangeIssue.currentPasswordRequired],
    ['newPassword', { currentPassword: 'current', newPassword: '  ', repeatNewPassword: '  ' }, passwordChangeIssue.newPasswordRequired],
    ['repeatNewPassword', { currentPassword: 'current', newPassword: 'new', repeatNewPassword: '' }, passwordChangeIssue.repeatNewPasswordRequired],
    ['mismatch', { currentPassword: 'current', newPassword: 'new', repeatNewPassword: 'different' }, passwordChangeIssue.passwordsMismatch],
  ])('rejects %s failure cases', (_caseName, input, expectedIssue) => {
    const result = v.safeParse(passwordChangeInputSchema, input, { abortEarly: true });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.issues[0]?.message).toBe(expectedIssue);
  });
});
