import * as v from 'valibot';

import { initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';
import { persistedAppStateSchema } from './local-state.schema';

describe('persistedAppStateSchema', () => {
  it('accepts an empty signed-out state and a complete Game Account state', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: { activeGameAccountId: null, gameAccounts: [] },
    }).success).toBe(true);
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: {
        activeGameAccountId: initialGameAccounts[0].id,
        gameAccounts: initialGameAccounts,
      },
    }).success).toBe(true);
  });

  it('rejects active IDs outside the Game Account collection', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: { activeGameAccountId: 'missing', gameAccounts: initialGameAccounts },
    }).success).toBe(false);
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: { activeGameAccountId: null, gameAccounts: initialGameAccounts },
    }).success).toBe(false);
  });

  it('rejects malformed nested Game Account data', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      auth: { session: null },
      games: {
        activeGameAccountId: initialGameAccounts[0].id,
        gameAccounts: [{ ...initialGameAccounts[0], exp: [1] }],
      },
    }).success).toBe(false);
  });
});
