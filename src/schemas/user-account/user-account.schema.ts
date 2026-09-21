import * as v from 'valibot';

export const qqBindingStateSchema = v.variant('status', [
  v.object({
    status: v.literal('unbound'),
    verificationCode: v.pipe(v.string(), v.minLength(1)),
  }),
  v.object({
    status: v.literal('bound'),
    verificationCode: v.null(),
  }),
]);

export const passwordChangeIssue = {
  currentPasswordRequired: 'currentPasswordRequired',
  newPasswordRequired: 'newPasswordRequired',
  repeatNewPasswordRequired: 'repeatNewPasswordRequired',
  passwordsMismatch: 'passwordsMismatch',
} as const;

const requiredPasswordSchema = (message: string) => v.pipe(
  v.string(),
  v.check((value) => value.trim().length > 0, message),
);

export const passwordChangeInputSchema = v.pipe(
  v.object({
    currentPassword: requiredPasswordSchema(passwordChangeIssue.currentPasswordRequired),
    newPassword: requiredPasswordSchema(passwordChangeIssue.newPasswordRequired),
    repeatNewPassword: requiredPasswordSchema(passwordChangeIssue.repeatNewPasswordRequired),
  }),
  v.forward(
    v.partialCheck(
      [['newPassword'], ['repeatNewPassword']],
      (input) => input.newPassword === input.repeatNewPassword,
      passwordChangeIssue.passwordsMismatch,
    ),
    ['repeatNewPassword'],
  ),
);

export type PasswordChangeInput = v.InferOutput<typeof passwordChangeInputSchema>;
export type QQBindingState = v.InferOutput<typeof qqBindingStateSchema>;
