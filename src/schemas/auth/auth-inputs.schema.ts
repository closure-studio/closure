import * as v from 'valibot';

import { nonBlankStringSchema } from '@/schemas/primitives';

const emailSchema = v.pipe(v.string(), v.trim(), v.email());
const accessTokenSchema = v.pipe(v.string(), v.minLength(1));

export const passwordUpdateInputSchema = v.object({
  accessToken: accessTokenSchema,
  currentPassword: nonBlankStringSchema,
  email: emailSchema,
  newPassword: nonBlankStringSchema,
});

export const passwordRecoveryRequestInputSchema = v.object({
  identifier: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export type PasswordRecoveryRequestInput = v.InferOutput<typeof passwordRecoveryRequestInputSchema>;
export type PasswordUpdateInput = v.InferOutput<typeof passwordUpdateInputSchema>;
