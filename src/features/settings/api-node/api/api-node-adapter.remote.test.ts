import { API_NODE_HOSTS, API_NODE_PROBE_PATH } from '@/constants/api';
import { RemoteApiNodeAdapter } from './api-node-adapter.remote';
import type { ApiNodeProbeFetch } from './api-node-adapter.remote';

describe('RemoteApiNodeAdapter', () => {
  it('probes every host and reports reachable latency', async () => {
    const request = jest.fn<ReturnType<ApiNodeProbeFetch>, Parameters<ApiNodeProbeFetch>>()
      .mockResolvedValue({ ok: true, status: 200 });
    const adapter = new RemoteApiNodeAdapter(request);

    const result = await adapter.queryNodes();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected API Node probe to succeed.');
    expect(result.data).toHaveLength(API_NODE_HOSTS.length);

    API_NODE_HOSTS.forEach((host, index) => {
      const node = result.data[index];
      if (!node) throw new Error(`Expected a probed node at index ${index}.`);
      expect(node.id).toBe(host.id);
      expect(node.description).toBe(host.description);
      expect(node.outcome).toBe('reachable');
      expect(Number.isInteger(node.latencyMs)).toBe(true);
      expect(node.latencyMs).toBeGreaterThanOrEqual(0);

      const call = request.mock.calls[index];
      if (!call) throw new Error(`Expected a probe call at index ${index}.`);
      expect(call[0]).toBe(`${host.baseURL}${API_NODE_PROBE_PATH}`);
      expect(call[1].signal).toBeDefined();
    });
  });

  it('marks a host unreachable when the probe rejects', async () => {
    const request = jest.fn<ReturnType<ApiNodeProbeFetch>, Parameters<ApiNodeProbeFetch>>()
      .mockResolvedValueOnce({ ok: true, status: 200 })
      .mockRejectedValueOnce(new Error('offline'));
    const adapter = new RemoteApiNodeAdapter(request);

    const result = await adapter.queryNodes();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected API Node probe to succeed.');
    expect(result.data.map((node) => node.outcome)).toEqual(['reachable', 'unreachable']);
    const unreachable = result.data[1];
    if (!unreachable) throw new Error('Expected a probed node at index 1.');
    expect(unreachable.latencyMs).toBe(0);
  });

  it('marks a host unreachable on a non-ok status', async () => {
    const request = jest.fn<ReturnType<ApiNodeProbeFetch>, Parameters<ApiNodeProbeFetch>>()
      .mockResolvedValue({ ok: false, status: 500 });
    const adapter = new RemoteApiNodeAdapter(request);

    const result = await adapter.queryNodes();

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected API Node probe to succeed.');
    expect(result.data.every((node) => node.outcome === 'unreachable')).toBe(true);
  });
});
