import { fetch } from 'expo/fetch';
import { assertActive, requestScope } from '@/services/request-scope';

import {
  API_NODE_HOSTS,
  API_NODE_PROBE_PATH,
  API_NODE_PROBE_TIMEOUT_MS,
} from '@/constants/api';
import type { ApiNodeHost } from '@/constants/api';
import type { ApiNode } from '@/schemas/api-node';
import type { ApiNodeAdapter, ApiNodeResult } from './api-node-adapter';

export type ApiNodeProbeFetch = (
  input: string,
  init: { signal: AbortSignal },
) => Promise<{ ok: boolean; status: number }>;

async function probeApiNode(
  host: ApiNodeHost,
  request: ApiNodeProbeFetch,
  signal: AbortSignal,
): Promise<ApiNode> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_NODE_PROBE_TIMEOUT_MS);
  const startedAt = Date.now();
  const cancel = () => controller.abort();
  signal.addEventListener('abort', cancel, { once: true });

  try {
    assertActive(signal);
    const response = await request(`${host.baseURL}${API_NODE_PROBE_PATH}`, {
      signal: controller.signal,
    });
    assertActive(signal);
    if (!response.ok) {
      return { id: host.id, description: host.description, latencyMs: 0, outcome: 'unreachable' };
    }
    return {
      id: host.id,
      description: host.description,
      latencyMs: Date.now() - startedAt,
      outcome: 'reachable',
    };
  } catch {
    assertActive(signal);
    return { id: host.id, description: host.description, latencyMs: 0, outcome: 'unreachable' };
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
  }
}

export class RemoteApiNodeAdapter implements ApiNodeAdapter {
  constructor(private readonly request: ApiNodeProbeFetch = fetch) {}

  async queryNodes(signal = requestScope()): Promise<ApiNodeResult<ApiNode[]>> {
    const nodes = await Promise.all(
      API_NODE_HOSTS.map((host) => probeApiNode(host, this.request, signal)),
    );
    return { data: nodes, ok: true };
  }
}
