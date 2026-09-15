import * as v from 'valibot';
import { verificationMessageSchema } from '@/schemas/verification';
import { finishVerification } from './verification-runtime';
import type { VerificationRequest } from '@/schemas/verification';
export function acceptVerificationMessage(raw: unknown, request: VerificationRequest): void {
  try {
    const data: unknown = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const parsed = v.safeParse(verificationMessageSchema, data);
    finishVerification(
      request,
      parsed.success && parsed.output.ok ? parsed.output.result : null,
    );
  } catch { finishVerification(request, null); }
}
