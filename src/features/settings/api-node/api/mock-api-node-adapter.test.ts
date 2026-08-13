import { MockApiNodeAdapter } from './mock-api-node-adapter';

describe('MockApiNodeAdapter', () => {
  it('returns schema-validated nodes as independent data', async () => {
    const adapter = new MockApiNodeAdapter(0);
    const first = await adapter.queryNodes();
    const second = await adapter.queryNodes();

    expect(first.ok).toBe(true);
    expect(second.ok).toBe(true);
    if (!first.ok || !second.ok) throw new Error('Expected API Node query to succeed.');
    expect(first.data).toEqual(second.data);
    expect(first.data).not.toBe(second.data);
    expect(first.data[0]).not.toBe(second.data[0]);
    expect(first.data[0]).toHaveProperty('latencyMs');
  });
});
