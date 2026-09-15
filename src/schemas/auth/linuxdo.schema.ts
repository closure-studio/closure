import * as v from 'valibot';
import { nonBlankStringSchema } from '@/schemas/primitives';

export const pkceCodeVerifierSchema = v.pipe(
  v.string(),
  v.regex(/^[a-f0-9]{64}$/),
);

export const linuxDoLoginInputSchema = v.object({
  code: nonBlankStringSchema,
  code_verifier: pkceCodeVerifierSchema,
});

export const linuxDoAuthorizationContextSchema = v.object({
  codeVerifier: pkceCodeVerifierSchema,
  expiresAt: v.pipe(v.number(), v.integer(), v.minValue(0)),
  returnTo: nonBlankStringSchema,
});

export type LinuxDoLoginInput = v.InferOutput<typeof linuxDoLoginInputSchema>;
export type LinuxDoAuthorizationContext = v.InferOutput<typeof linuxDoAuthorizationContextSchema>;
