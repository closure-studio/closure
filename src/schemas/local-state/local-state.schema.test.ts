import * as v from 'valibot';

import { mockActiveSession } from '@/mocks/auth';
import { persistedStoreStateSchema } from './local-state.schema';

describe('persistedStoreStateSchema', () => {
  it('accepts a signed-out client state', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      activeGameAccountId: null,
      auth: { session: null },
      selectedApiNodeId: 'domestic',
    }).success).toBe(true);
  });

  it('accepts a remembered session with a selected node and game account', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      activeGameAccountId: 'G18928069156',
      auth: { session: mockActiveSession },
      selectedApiNodeId: 'overseas',
    }).success).toBe(true);
  });

  it('rejects malformed sessions and node selections', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      activeGameAccountId: null,
      auth: { session: { accessToken: '' } },
      selectedApiNodeId: 'domestic',
    }).success).toBe(false);
    expect(v.safeParse(persistedStoreStateSchema, {
      activeGameAccountId: null,
      auth: { session: null },
      selectedApiNodeId: 'mars',
    }).success).toBe(false);
  });
});