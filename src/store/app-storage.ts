import * as v from 'valibot';
import type { PersistStorage } from 'zustand/middleware';

import { gameResourcesStateSchema } from '@/schemas/game-data';
import {
  gamesStateSchema,
  persistedAppStateSchema,
} from '@/schemas/local-state';
import type { PersistedAppState, PersistedStoreState } from '@/schemas/local-state';
import type {
  GameResourcesState,
} from '@/schemas/game-data';
import { userSessionSchema } from '@/schemas/auth';
import { apiNodeIdSchema } from '@/schemas/api-node';

export const APP_STORE_STORAGE_KEY = 'closure.app-store';
export const GAME_RESOURCES_STORAGE_KEY = 'closure.game-resources';

export type SyncStateStorage = {
  getItem: (name: string) => string | null;
  removeItem: (name: string) => unknown;
  setItem: (name: string, value: string) => unknown;
};

const appStateMigrationSchema = v.object({
  auth: v.object({ session: v.nullable(userSessionSchema) }),
  games: gamesStateSchema,
  network: v.optional(v.unknown()),
});

const previousAppStateSchema = v.object({
  state: appStateMigrationSchema,
  version: v.optional(v.number()),
});

function parseStored<T>(
  raw: string | null,
  schema: v.GenericSchema<unknown, T>,
): T | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    const result = v.safeParse(schema, value);
    return result.success ? result.output : null;
  } catch {
    return null;
  }
}

function parseAppState(raw: string | null): PersistedAppState | null {
  const current = parseStored(raw, persistedAppStateSchema);
  if (current) return current;

  const bare = parseStored(raw, appStateMigrationSchema);
  const previous = bare ? null : parseStored(raw, previousAppStateSchema);
  const state = bare ?? previous?.state;
  if (!state) return null;
  const networkValue = state.network;
  const candidateNodeId = typeof networkValue === 'object'
    && networkValue !== null
    && 'selectedApiNodeId' in networkValue
    ? networkValue.selectedApiNodeId
    : undefined;
  const selectedApiNodeId = v.safeParse(apiNodeIdSchema, candidateNodeId);
  return {
    auth: state.auth,
    games: state.games,
    network: {
      selectedApiNodeId: selectedApiNodeId.success
        ? selectedApiNodeId.output
        : 'domestic',
    },
  };
}

export function createAppPersistStorage(
  storage: SyncStateStorage,
): PersistStorage<PersistedStoreState> {
  let resources: GameResourcesState | undefined;

  return {
    getItem: () => {
      const app = parseAppState(storage.getItem(APP_STORE_STORAGE_KEY));
      const gameResources = parseStored(
        storage.getItem(GAME_RESOURCES_STORAGE_KEY),
        gameResourcesStateSchema,
      );
      if (!app) storage.removeItem(APP_STORE_STORAGE_KEY);
      if (!gameResources) storage.removeItem(GAME_RESOURCES_STORAGE_KEY);
      if (!app && !gameResources) return null;

      const nextResources = gameResources ?? {
        character: null,
        checkedAt: null,
        item: null,
        stage: null,
      };
      resources = nextResources;
      return {
        state: {
          app: app ?? {
            auth: { session: null },
            games: null,
            network: { selectedApiNodeId: 'domestic' },
          },
          gameResources: nextResources,
        },
      };
    },
    removeItem: () => {
      resources = undefined;
      storage.removeItem(APP_STORE_STORAGE_KEY);
      storage.removeItem(GAME_RESOURCES_STORAGE_KEY);
    },
    setItem: (_name, value) => {
      storage.setItem(APP_STORE_STORAGE_KEY, JSON.stringify(value.state.app));
      if (resources !== value.state.gameResources) {
        resources = value.state.gameResources;
        storage.setItem(
          GAME_RESOURCES_STORAGE_KEY,
          JSON.stringify(value.state.gameResources),
        );
      }
    },
  };
}
