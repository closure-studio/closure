import * as v from 'valibot';

import { apiNodeSchema } from '@/schemas/api-node';
import type { ApiNode } from '@/schemas/api-node';
import { mockApiNodes } from './api-node-fixtures';

const mockFailedApiNode = {
  id: 'overseas',
  description: 'Cloudflare API Server',
  mockLatencyMs: 0,
  outcome: 'unreachable',
} satisfies ApiNode;

describe('API Node fixtures', () => {
  it('keeps every API Node fixture valid', () => {
    for (const apiNode of [...mockApiNodes, mockFailedApiNode]) {
      expect(v.safeParse(apiNodeSchema, apiNode).success).toBe(true);
    }
  });
});
