import * as v from 'valibot';

import {
  passwordChangeInputSchema,
  passwordChangeIssue,
  qqBindingStateSchema,
} from './user-account.schema';

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


describe('qqBindingStateSchema', () => {
  it.each([
    { status: 'unbound', verificationCode: 'verifyCode:abc123' },
    { status: 'bound', verificationCode: null },
  ])('accepts a valid $status state', (input) => {
    expect(v.safeParse(qqBindingStateSchema, input)).toMatchObject({ success: true });
  });

  it.each([
    { status: 'unbound', verificationCode: '' },
    { status: 'bound', verificationCode: 'verifyCode:abc123' },
    { status: 'unknown', verificationCode: null },
  ])('rejects an invalid QQ binding state', (input) => {
    expect(v.safeParse(qqBindingStateSchema, input).success).toBe(false);
  });
});
