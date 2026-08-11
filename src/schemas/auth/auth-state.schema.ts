import * as v from 'valibot';

import { loginCredentialsSchema } from './login-credentials.schema';

export const authStateSchema = v.variant('status', [
  v.object({
    credentials: v.null_(),
    status: v.literal('unauthenticated'),
    token: v.null_(),
  }),
  v.object({
    credentials: loginCredentialsSchema,
    status: v.literal('authenticated'),
    token: v.pipe(v.string(), v.minLength(1)),
  }),
]);

export type AuthState = v.InferOutput<typeof authStateSchema>;
