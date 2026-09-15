import { requestScope, assertActive } from '@/services/request-scope';
import type { VerificationRequest, VerificationResult } from '@/schemas/verification';

type ActiveVerification = {
  request: VerificationRequest;
  settle: (result: VerificationResult | null) => void;
};

let active: ActiveVerification | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function subscribeVerification(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVerificationRequest(): VerificationRequest | null {
  return active?.request ?? null;
}

export function finishVerification(
  request: VerificationRequest,
  result: VerificationResult | null,
): void {
  if (active?.request !== request) return;
  active.settle(result);
}

export function runVerification(
  request: VerificationRequest,
  scope: AbortSignal = requestScope(),
): Promise<VerificationResult> {
  assertActive(scope);
  if (active) return Promise.reject(new Error('Verification busy'));
  return new Promise((resolve, reject) => {
    const abort = () => settle(null);
    const timeout = setTimeout(abort, request.kind === 'registration' ? 15000 : 120000);
    const settle = (result: VerificationResult | null) => {
      if (active?.settle !== settle) return;
      clearTimeout(timeout);
      scope.removeEventListener('abort', abort);
      active = null;
      emit();
      if (result === null || scope.aborted) reject(new Error('Verification cancelled'));
      else resolve(result);
    };
    scope.addEventListener('abort', abort, { once: true });
    active = { request, settle };
    emit();
  });
}
