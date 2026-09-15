import * as v from 'valibot';
import { arkHostCaptchaInfoSchema, gameCaptchaSubmissionSchema } from '@/schemas/arkhost';
import { registrationProofSchema } from '@/schemas/auth';
export const verificationRequestSchema = v.variant('kind', [
  v.object({ kind: v.literal('registration'), email: v.string(), password: v.string() }),
  v.object({ kind: v.literal('google') }),
  v.object({ kind: v.literal('game'), account: v.string(), captcha: arkHostCaptchaInfoSchema }),
]);
export const verificationResultSchema = v.union([registrationProofSchema, gameCaptchaSubmissionSchema, v.pipe(v.string(), v.minLength(1))]);
export const verificationMessageSchema = v.variant('ok', [
  v.object({ ok: v.literal(true), result: verificationResultSchema }),
  v.object({ ok: v.literal(false) }),
]);
export type VerificationRequest = v.InferOutput<typeof verificationRequestSchema>;
export type VerificationResult = v.InferOutput<typeof verificationResultSchema>;
