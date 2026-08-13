import * as v from 'valibot';

const nonBlankStringSchema = v.pipe(
  v.string(),
  v.check((value) => value.trim().length > 0),
);
const emailSchema = v.pipe(v.string(), v.trim(), v.email());
const accessTokenSchema = v.pipe(v.string(), v.minLength(1));
const permissionSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

export const registrationInputSchema = v.object({
  code: nonBlankStringSchema,
  email: emailSchema,
  noise: nonBlankStringSchema,
  password: nonBlankStringSchema,
  sign: nonBlankStringSchema,
});

export const passwordResetInputSchema = v.object({
  code: nonBlankStringSchema,
  email: emailSchema,
  newPassword: nonBlankStringSchema,
});

export const passwordUpdateInputSchema = v.object({
  accessToken: accessTokenSchema,
  currentPassword: nonBlankStringSchema,
  email: emailSchema,
  newPassword: nonBlankStringSchema,
});

export const passwordRecoveryRequestInputSchema = v.object({
  identifier: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export const adminUserQueryInputSchema = v.object({
  accessToken: accessTokenSchema,
  query: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export const userPermissionUpdateInputSchema = v.object({
  accessToken: accessTokenSchema,
  permission: permissionSchema,
  userId: v.pipe(v.string(), v.minLength(1)),
});

export const registrationCodeInputSchema = v.object({ email: emailSchema });

export const adminLoginInputSchema = v.object({
  accessToken: accessTokenSchema,
  userId: v.pipe(v.string(), v.minLength(1)),
});

export const sessionRefreshInputSchema = v.object({ accessToken: accessTokenSchema });

export const qqBindCodeInputSchema = v.object({ accessToken: accessTokenSchema });

export const linuxDoLoginInputSchema = v.object({
  code: nonBlankStringSchema,
  redirectUri: v.pipe(v.string(), v.url()),
});

export type RegistrationInput = v.InferOutput<typeof registrationInputSchema>;
export type PasswordResetInput = v.InferOutput<typeof passwordResetInputSchema>;
export type PasswordUpdateInput = v.InferOutput<typeof passwordUpdateInputSchema>;
export type PasswordRecoveryRequestInput = v.InferOutput<typeof passwordRecoveryRequestInputSchema>;
export type AdminUserQueryInput = v.InferOutput<typeof adminUserQueryInputSchema>;
export type UserPermissionUpdateInput = v.InferOutput<typeof userPermissionUpdateInputSchema>;
export type RegistrationCodeInput = v.InferOutput<typeof registrationCodeInputSchema>;
export type AdminLoginInput = v.InferOutput<typeof adminLoginInputSchema>;
export type SessionRefreshInput = v.InferOutput<typeof sessionRefreshInputSchema>;
export type QqBindCodeInput = v.InferOutput<typeof qqBindCodeInputSchema>;
export type LinuxDoLoginInput = v.InferOutput<typeof linuxDoLoginInputSchema>;
