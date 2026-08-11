import * as v from 'valibot';

import { authStateSchema } from '@/schemas/auth';
import { gameAccountSchema } from '@/schemas/game-account';

export const gamesStateSchema = v.pipe(
  v.object({
    activeGameAccountId: v.nullable(v.string()),
    gameAccounts: v.array(gameAccountSchema),
  }),
  v.check(
    ({ activeGameAccountId, gameAccounts }) => activeGameAccountId === null
      ? gameAccounts.length === 0
      : gameAccounts.some((gameAccount) => gameAccount.id === activeGameAccountId),
    'The active Game Account must belong to the stored Game Accounts.',
  ),
);

export const persistedAppStateSchema = v.object({
  games: gamesStateSchema,
  user: authStateSchema,
});

export type GamesState = v.InferOutput<typeof gamesStateSchema>;
export type PersistedAppState = v.InferOutput<typeof persistedAppStateSchema>;
