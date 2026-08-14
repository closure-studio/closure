import type { AuthAdapter } from '@/features/auth/api';
import { MockAuthAdapter } from '@/features/auth/api';
import type { ArkHostApi, GameResourcesApi } from '@/features/dashboard/api';
import {
  MockArkHostApi,
  RemoteGameResourcesApi,
} from '@/features/dashboard/api';
import type { ApiNodeAdapter } from '@/features/settings/api-node/api';
import { MockApiNodeAdapter } from '@/features/settings/api-node/api';

export type QueryDependencies = {
  apiNodeAdapter: ApiNodeAdapter;
  arkHostApi: ArkHostApi;
  authAdapter: AuthAdapter;
  gameResourcesApi: GameResourcesApi;
};

const defaultDependencies: QueryDependencies = {
  apiNodeAdapter: new MockApiNodeAdapter(),
  arkHostApi: new MockArkHostApi(),
  authAdapter: new MockAuthAdapter(),
  gameResourcesApi: new RemoteGameResourcesApi(),
};

let currentDependencies: QueryDependencies = defaultDependencies;

export function getQueryDependencies(): QueryDependencies {
  return currentDependencies;
}

export function configureQueryDependencies(
  overrides: Partial<QueryDependencies>,
): void {
  currentDependencies = { ...currentDependencies, ...overrides };
}

export function resetQueryDependencies(): void {
  currentDependencies = defaultDependencies;
}