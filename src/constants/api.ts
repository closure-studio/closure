import type { ApiNodeId } from '@/schemas/api-node';

export type ApiNodeHost = {
  baseURL: string;
  description: string;
  id: ApiNodeId;
};

export const API_NODE_HOSTS: readonly [ApiNodeHost, ...ApiNodeHost[]] = [
  { baseURL: 'https://api.ltsc.vip', description: 'LTSC API Server', id: 'domestic' },
  {
    baseURL: 'https://api-tunnel.arknights.app',
    description: 'Cloudflare API Server',
    id: 'overseas',
  },
];

export const API_NODE_PROBE_PATH = '/system/config';
export const API_NODE_PROBE_TIMEOUT_MS = 5000;
export const ARK_RESOURCES_ORIGIN = 'https://ark-resource.arknights.app';
