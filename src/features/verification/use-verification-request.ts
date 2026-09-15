import { useSyncExternalStore } from 'react';
import type { VerificationRequest } from '@/schemas/verification';
import {
  getVerificationRequest,
  subscribeVerification,
} from './verification-runtime';

function getServerVerificationRequest(): VerificationRequest | null {
  return null;
}

export function useVerificationRequest(): VerificationRequest | null {
  return useSyncExternalStore(
    subscribeVerification,
    getVerificationRequest,
    getServerVerificationRequest,
  );
}
