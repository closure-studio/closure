import * as v from 'valibot';

import { nonBlankStringSchema } from '@/schemas/primitives';
import type { LoginCredentials } from './login-credentials.schema';

const emailSchema = v.pipe(v.string(), v.trim(), v.email());
const accessTokenSchema = v.pipe(v.string(), v.minLength(1));

export const passwordUpdateInputSchema = v.object({
  accessToken: accessTokenSchema,
  currentPassword: nonBlankStringSchema,
  email: emailSchema,
  newPassword: nonBlankStringSchema,
});

export const emailCodeRequestInputSchema = v.object({
  email: emailSchema,
});

export type EmailCodeRequestInput = v.InferOutput<typeof emailCodeRequestInputSchema>;
export type PasswordUpdateInput = v.InferOutput<typeof passwordUpdateInputSchema>;

const newPasswordSchema = v.pipe(v.string(), v.minLength(8));
export const registrationInputSchema = v.object({
  email: emailSchema, password: newPasswordSchema, code: nonBlankStringSchema,
});
export const passwordResetInputSchema = v.object({
  email: emailSchema, code: nonBlankStringSchema, password: newPasswordSchema,
});
export const registrationProofSchema = v.object({ noise: nonBlankStringSchema, sign: nonBlankStringSchema });
export type RegistrationInput = v.InferOutput<typeof registrationInputSchema>;
export type PasswordResetInput = v.InferOutput<typeof passwordResetInputSchema>;
export type AuthFormSubmission =
  | ({ kind: 'login' } & LoginCredentials)
  | ({ kind: 'register' } & RegistrationInput)
  | ({ kind: 'reset-password' } & PasswordResetInput);
