import { MockAuthAdapter } from '@/features/auth/api/auth-adapter.mock';
import { RemoteAuthAdapter } from '@/features/auth/api/auth-adapter.remote';
import type { AuthAdapter } from '@/features/auth/api/auth-adapter';
import {
  beginLinuxDoAuthorization, completeLinuxDoAuthorization,
  linuxDoAvailable, takeLinuxDoWebCallback,
} from '@/features/auth/linuxdo';
import type { LinuxDoCompletion } from '@/features/auth/linuxdo';
import { MockArkHostApi } from '@/features/dashboard/api/arkhost-api.mock';
import { RemoteArkHostApi } from '@/features/dashboard/api/arkhost-api.remote';
import type { ArkHostApi } from '@/features/dashboard/api/arkhost-api';
import { RemoteGameResourcesApi } from '@/features/dashboard/api/game-resources-api';
import type { GameResourcesApi } from '@/features/dashboard/api/game-resources-api';
import { RemoteApiNodeAdapter } from '@/features/settings/api-node/api/api-node-adapter.remote';
import type { ApiNodeAdapter } from '@/features/settings/api-node/api/api-node-adapter';
import { runVerification } from '@/features/verification/verification-runtime';
import { mockApiNodes } from '@/mocks/api-node';
import type { PostLoginDestination } from '@/routing/auth-routing';
import type { VerificationRequest, VerificationResult } from '@/schemas/verification';
import { appStore } from '@/store';
import { assertActive } from './request-scope';

// Store hydration is synchronous. These selections remain fixed until restart.
const useMock = appStore.getState().requestMode === 'mock';
const MOCK_CODE_VERIFIER = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

export const authApi: AuthAdapter = useMock
  ? new MockAuthAdapter()
  : new RemoteAuthAdapter();

export const arkHostApi: ArkHostApi = useMock
  ? new MockArkHostApi()
  : new RemoteArkHostApi();

export const apiNodeApi: ApiNodeAdapter = useMock
  ? { queryNodes: () => Promise.resolve({ ok: true, data: structuredClone(mockApiNodes) }) }
  : new RemoteApiNodeAdapter();

// Resource queries already have local tables; Mock never checks the network.
export const gameResourcesApi: GameResourcesApi = useMock
  ? {
    fetchCharacter: () => Promise.resolve({ kind: 'unavailable' }),
    fetchItem: () => Promise.resolve({ kind: 'unavailable' }),
    fetchStage: () => Promise.resolve({ kind: 'unavailable' }),
  }
  : new RemoteGameResourcesApi();

export const linuxDoLoginAvailable = useMock || linuxDoAvailable;

export const authorizeLinuxDo: (
  signal: AbortSignal,
  returnTo: PostLoginDestination,
) => Promise<LinuxDoCompletion | null> = useMock
  ? (signal, returnTo) => {
    assertActive(signal);
    return Promise.resolve({
      input: { code: 'mock-linuxdo', code_verifier: MOCK_CODE_VERIFIER },
      returnTo,
    });
  }
  : async (signal, returnTo) => {
    const result = await beginLinuxDoAuthorization(signal, returnTo);
    return result.type === 'callback' ? completeLinuxDoAuthorization(result) : null;
  };

export const consumeLinuxDoCallback: () => LinuxDoCompletion = useMock
  ? () => {
    throw new Error('No browser authorization in this environment');
  }
  : () => completeLinuxDoAuthorization(takeLinuxDoWebCallback());

export const verifyGame: (
  request: Extract<VerificationRequest, { kind: 'game' }>,
  signal: AbortSignal,
) => Promise<VerificationResult> = useMock
  ? (request, signal) => {
    assertActive(signal);
    return Promise.resolve({
      challenge: request.captcha.challenge,
      geetest_challenge: 'mock',
      geetest_validate: 'mock',
      geetest_seccode: 'mock',
    });
  }
  : runVerification;
