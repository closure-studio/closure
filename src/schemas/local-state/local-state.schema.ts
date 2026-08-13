import * as v from 'valibot';

import {
  arkHostApCostEntrySchema,
  arkHostCharactersSchema,
  arkHostGameDetailSchema,
  arkHostGameLogsSchema,
  arkHostGachaEventSchema,
  arkHostSystemConfigSchema,
} from '@/schemas/arkhost';
import { userSessionSchema } from '@/schemas/auth';
import { gameAccountSchema } from '@/schemas/game-account';
import { gameResourcesStateSchema } from '@/schemas/game-data';

const gamesSnapshotSchema = v.pipe(
  v.object({
    activeGameAccountId: v.nullable(v.string()),
    apCostRanking: v.array(arkHostApCostEntrySchema),
    charactersByAccount: v.record(v.string(), arkHostCharactersSchema),
    detailsByAccount: v.record(v.string(), arkHostGameDetailSchema),
    gameAccounts: v.array(gameAccountSchema),
    gachaEvents: v.array(arkHostGachaEventSchema),
    logsByAccount: v.record(v.string(), arkHostGameLogsSchema),
    ownerUserId: v.pipe(v.string(), v.minLength(1)),
    systemConfig: arkHostSystemConfigSchema,
  }),
  v.check(
    ({ activeGameAccountId, gameAccounts }) => activeGameAccountId === null
      ? gameAccounts.length === 0
      : gameAccounts.some((gameAccount) => gameAccount.account === activeGameAccountId),
    'The active Game Account must belong to the stored Game Accounts.',
  ),
);

export const gamesStateSchema = v.nullable(gamesSnapshotSchema);

export const persistedAppStateSchema = v.object({
  auth: v.object({ session: v.nullable(userSessionSchema) }),
  games: gamesStateSchema,
});

export const persistedStoreStateSchema = v.object({
  app: persistedAppStateSchema,
  gameResources: gameResourcesStateSchema,
});

export type GamesState = v.InferOutput<typeof gamesStateSchema>;
export type PersistedAppState = v.InferOutput<typeof persistedAppStateSchema>;
export type PersistedStoreState = v.InferOutput<typeof persistedStoreStateSchema>;
