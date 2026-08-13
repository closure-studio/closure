import { RemoteGameResourcesApi } from './game-resources-api';
import type { GameResourceFetch } from './game-resources-api';

const CURRENT_UPDATED_AT = '2026-08-10T10:20:41.000Z';
const NEW_UPDATED_AT = 'Tue, 11 Aug 2026 10:20:41 GMT';

function createResponse({
  body = {},
  lastModified = NEW_UPDATED_AT,
  ok = true,
  status = 200,
}: {
  body?: unknown;
  lastModified?: string | null;
  ok?: boolean;
  status?: number;
}) {
  return {
    headers: { get: () => lastModified },
    json: () => Promise.resolve(body),
    ok,
    status,
  };
}

describe('Remote Game Resources API', () => {
  it('sends a conditional request and validates an updated table', async () => {
    const request = jest.fn<ReturnType<GameResourceFetch>, Parameters<GameResourceFetch>>().mockResolvedValue(createResponse({
      body: {
        item_alpha: { icon: 'ITEM_ALPHA', name: '测试物品甲' },
      },
    }));
    const api = new RemoteGameResourcesApi(request);

    await expect(api.fetchItem(CURRENT_UPDATED_AT)).resolves.toEqual({
      kind: 'updated',
      table: { item_alpha: { icon: 'ITEM_ALPHA', name: '测试物品甲' } },
      updatedAt: '2026-08-11T10:20:41.000Z',
    });
    expect(request).toHaveBeenCalledWith(
      'https://ark-resource.arknights.app/data/item_table.json',
      { headers: { 'If-Modified-Since': 'Mon, 10 Aug 2026 10:20:41 GMT' } },
    );
  });

  it('accepts a 304 without reading a body', async () => {
    const response = createResponse({ ok: false, status: 304 });
    const api = new RemoteGameResourcesApi(() => Promise.resolve(response));

    await expect(api.fetchItem(CURRENT_UPDATED_AT)).resolves.toEqual({ kind: 'not-modified' });
  });

  it.each([
    ['missing Last-Modified', createResponse({ lastModified: null })],
    ['invalid Last-Modified', createResponse({ lastModified: 'not-a-date' })],
    ['empty table', createResponse({ body: {} })],
    ['malformed table', createResponse({ body: { item_alpha: { name: '测试物品' } } })],
    ['HTTP failure', createResponse({ ok: false, status: 500 })],
  ])('rejects %s without exposing untrusted data', async (_caseName, response) => {
    const api = new RemoteGameResourcesApi(() => Promise.resolve(response));

    await expect(api.fetchItem(CURRENT_UPDATED_AT)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('maps a rejected fetch to unavailable', async () => {
    const api = new RemoteGameResourcesApi(() => Promise.reject(new Error('offline')));

    await expect(api.fetchItem(CURRENT_UPDATED_AT)).resolves.toEqual({ kind: 'unavailable' });
  });
});
