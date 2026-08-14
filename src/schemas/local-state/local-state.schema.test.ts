import * as v from 'valibot';

import { mockActiveSession } from '@/mocks/auth';
import { persistedStoreStateSchema } from './local-state.schema';

describe('persistedStoreStateSchema', () => {
  it('accepts a signed-out client state', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      auth: { session: null },
      selectedApiNodeId: 'domestic',
    }).success).toBe(true);
  });

  it('accepts a remembered session with a selected node', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      auth: { session: mockActiveSession },
      selectedApiNodeId: 'overseas',
    }).success).toBe(true);
  });

  it('drops the old development-only game account selection field', () => {
    const result = v.safeParse(persistedStoreStateSchema, {
      activeGameAccountId: 'G18928069156',
      auth: { session: mockActiveSession },
      selectedApiNodeId: 'domestic',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect('activeGameAccountId' in result.output).toBe(false);
      expect('selectedGameAccountId' in result.output).toBe(false);
    }
  });

  it('rejects malformed sessions and node selections', () => {
    expect(v.safeParse(persistedStoreStateSchema, {
      auth: { session: { accessToken: '' } },
      selectedApiNodeId: 'domestic',
    }).success).toBe(false);
    expect(v.safeParse(persistedStoreStateSchema, {
      auth: { session: null },
      selectedApiNodeId: 'mars',
    }).success).toBe(false);
  });
});
