import * as v from 'valibot';

import { apiNodeSchema } from './api-node.schema';

const validApiNode = {
  id: 'domestic',
  description: 'LTSC API Server',
  mockLatencyMs: 48,
  outcome: 'reachable',
} as const;

describe('apiNodeSchema', () => {
  it('accepts a complete API Node', () => {
    expect(v.safeParse(apiNodeSchema, validApiNode).success).toBe(true);
  });

  it('accepts zero milliseconds as the lower latency boundary', () => {
    expect(v.safeParse(apiNodeSchema, { ...validApiNode, mockLatencyMs: 0 }).success).toBe(true);
  });

  it.each([
    { ...validApiNode, id: 'edge' },
    { ...validApiNode, description: '' },
    { ...validApiNode, mockLatencyMs: -1 },
    { ...validApiNode, mockLatencyMs: 12.5 },
    { ...validApiNode, outcome: 'unknown' },
  ])('rejects malformed API Node data', (input) => {
    expect(v.safeParse(apiNodeSchema, input).success).toBe(false);
  });
});
