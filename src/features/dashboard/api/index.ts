export type {
  ArkHostApi,
  ArkHostFailure,
  ArkHostResult,
  ArkHostSseEvent,
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

export { arkHostApi, gameResourcesApi } from '@/services/api';
