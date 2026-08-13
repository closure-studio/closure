import type { ApiNode } from '@/schemas/api-node';

export const mockApiNodes = [
  {
    id: 'domestic',
    description: 'LTSC API Server',
    latencyMs: 48,
    outcome: 'reachable',
  },
  {
    id: 'overseas',
    description: 'Cloudflare API Server',
    latencyMs: 126,
    outcome: 'reachable',
  },
] satisfies [ApiNode, ApiNode];
