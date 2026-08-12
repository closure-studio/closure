import type { ApiNode } from '@/schemas/api-node';

export const mockApiNodes = [
  {
    id: 'domestic',
    description: 'LTSC API Server',
    mockLatencyMs: 48,
    outcome: 'reachable',
  },
  {
    id: 'overseas',
    description: 'Cloudflare API Server',
    mockLatencyMs: 126,
    outcome: 'reachable',
  },
] satisfies [ApiNode, ApiNode];
