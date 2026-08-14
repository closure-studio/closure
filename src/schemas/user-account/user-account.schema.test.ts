import * as v from 'valibot';

import {
  passwordChangeInputSchema,
  passwordChangeIssue,
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
