import { MockArkHostApi } from './arkhost-api.mock';
import { RemoteGameResourcesApi } from './game-resources-api';

export type {
  ArkHostApi,
  ArkHostFailure,
  ArkHostResult,
  ArkHostSseEvent,
  ArkHostSseListener,
  ArkHostSseSubscription,
} from './arkhost-api';
export { MockArkHostApi } from './arkhost-api.mock';
export { RemoteGameResourcesApi } from './game-resources-api';
export type {
  GameResourceFetch,
  GameResourceResponse,
  GameResourceResult,
  GameResourcesApi,
} from './game-resources-api';

export const arkHostApi = new MockArkHostApi();
export const gameResourcesApi = new RemoteGameResourcesApi();
