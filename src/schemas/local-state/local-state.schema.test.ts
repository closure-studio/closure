import * as v from 'valibot';

import { initialGameAccounts } from '@/features/dashboard/mocks/game-accounts';
import { persistedAppStateSchema } from './local-state.schema';

const unauthenticatedUser = {
  credentials: null,
  status: 'unauthenticated',
  token: null,
} as const;

describe('persistedAppStateSchema', () => {
  it('accepts an empty signed-out state and a complete Game Account state', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      games: { activeGameAccountId: null, gameAccounts: [] },
      user: unauthenticatedUser,
    }).success).toBe(true);
    expect(v.safeParse(persistedAppStateSchema, {
      games: {
        activeGameAccountId: initialGameAccounts[0].id,
        gameAccounts: initialGameAccounts,
      },
      user: unauthenticatedUser,
    }).success).toBe(true);
  });

  it('rejects active IDs outside the Game Account collection', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      games: { activeGameAccountId: 'missing', gameAccounts: initialGameAccounts },
      user: unauthenticatedUser,
    }).success).toBe(false);
    expect(v.safeParse(persistedAppStateSchema, {
      games: { activeGameAccountId: null, gameAccounts: initialGameAccounts },
      user: unauthenticatedUser,
    }).success).toBe(false);
  });

  it('rejects malformed nested Game Account data', () => {
    expect(v.safeParse(persistedAppStateSchema, {
      games: {
        activeGameAccountId: initialGameAccounts[0].id,
        gameAccounts: [{ ...initialGameAccounts[0], exp: [1] }],
      },
      user: unauthenticatedUser,
    }).success).toBe(false);
  });
});
