import { RemoteApiNodeAdapter } from './api-node-adapter.remote';

export type {
  ApiNodeAdapter,
  ApiNodeFailure,
  ApiNodeResult,
} from './api-node-adapter';
export { RemoteApiNodeAdapter } from './api-node-adapter.remote';
export type { ApiNodeProbeFetch } from './api-node-adapter.remote';

export const apiNodeApi = new RemoteApiNodeAdapter();
