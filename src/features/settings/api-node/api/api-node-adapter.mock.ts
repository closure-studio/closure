import * as v from 'valibot';

import { apiNodeSchema } from '@/schemas/api-node';
import type { ApiNode } from '@/schemas/api-node';
import type { ApiNodeAdapter, ApiNodeResult } from './api-node-adapter';
import { mockApiNodes } from '@/mocks/api-node';

const MOCK_API_NODE_DELAY_MS = 650;

const apiNodesSchema = v.array(apiNodeSchema);

export class MockApiNodeAdapter implements ApiNodeAdapter {
  readonly #delayMs: number;

  constructor(delayMs = MOCK_API_NODE_DELAY_MS) {
    this.#delayMs = delayMs;
  }

  async #wait(): Promise<void> {
    if (this.#delayMs === 0) return;
    await new Promise<void>((resolve) => {
      setTimeout(resolve, this.#delayMs);
    });
  }

  async queryNodes(): Promise<ApiNodeResult<ApiNode[]>> {
    await this.#wait();
    const parsed = v.safeParse(apiNodesSchema, mockApiNodes);
    if (!parsed.success) {
      return {
        error: { code: 'invalid-response', kind: 'invalid-response' },
        ok: false,
      };
    }
    return { data: structuredClone(parsed.output), ok: true };
  }
}
