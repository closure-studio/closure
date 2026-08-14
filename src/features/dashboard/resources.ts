import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { GameResourceResult } from './api';
import {
  GAME_RESOURCE_CACHE_KEYS,
  loadCachedGameResource,
  saveCachedGameResource,
} from './game-resource-cache';
import {
  bundledCharacterTable,
  bundledItemTable,
  bundledStageTable,
} from './game-data';
import { getQueryDependencies } from '@/services/query-dependencies';
import {
  characterTableSchema,
  itemTableSchema,
  stageTableSchema,
} from '@/schemas/game-data';
import type {
  CharacterTable,
  ItemTable,
  StageTable,
} from '@/schemas/game-data';
import * as v from 'valibot';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
export const GAME_RESOURCES_STALE_TIME_MS = HOURS_PER_DAY
  * MINUTES_PER_HOUR
  * SECONDS_PER_MINUTE
  * MILLISECONDS_PER_SECOND;

type GameResourceData<T> = {
  table: T;
  updatedAt: string | null;
};

const GAME_RESOURCE_QUERY_KEY = 'game-resources';

const gameResourceQueryKeys = {
  character: [GAME_RESOURCE_QUERY_KEY, 'character'] as const,
  item: [GAME_RESOURCE_QUERY_KEY, 'item'] as const,
  stage: [GAME_RESOURCE_QUERY_KEY, 'stage'] as const,
};

const characterBundled: GameResourceData<CharacterTable> = {
  table: bundledCharacterTable,
  updatedAt: null,
};
const itemBundled: GameResourceData<ItemTable> = {
  table: bundledItemTable,
  updatedAt: null,
};
const stageBundled: GameResourceData<StageTable> = {
  table: bundledStageTable,
  updatedAt: null,
};

function useGameResourceQuery<T>(
  queryKey: readonly string[],
  cacheKey: string,
  schema: v.GenericSchema<unknown, T>,
  bundled: GameResourceData<T>,
  fetchResource: (updatedAt: string | null) => Promise<GameResourceResult<T>>,
) {
  const queryClient = useQueryClient();
  const initial = useMemo(
    () => loadCachedGameResource(cacheKey, schema) ?? bundled,
    [bundled, cacheKey, schema],
  );
  return useQuery({
    queryKey,
    initialData: initial,
    initialDataUpdatedAt: initial.updatedAt === null
      ? 0
      : Date.parse(initial.updatedAt),
    staleTime: GAME_RESOURCES_STALE_TIME_MS,
    queryFn: async () => {
      const current = queryClient.getQueryData<GameResourceData<T>>(queryKey)
        ?? initial;
      const result = await fetchResource(current.updatedAt);
      if (result.kind !== 'updated') return current;
      const next = { table: result.table, updatedAt: result.updatedAt };
      saveCachedGameResource(cacheKey, next);
      return next;
    },
  });
}

export function useCharacterTable(): CharacterTable {
  return useGameResourceQuery(
    gameResourceQueryKeys.character,
    GAME_RESOURCE_CACHE_KEYS.character,
    characterTableSchema,
    characterBundled,
    (updatedAt) => getQueryDependencies().gameResourcesApi.fetchCharacter(updatedAt),
  ).data.table;
}

export function useItemTable(): ItemTable {
  return useGameResourceQuery(
    gameResourceQueryKeys.item,
    GAME_RESOURCE_CACHE_KEYS.item,
    itemTableSchema,
    itemBundled,
    (updatedAt) => getQueryDependencies().gameResourcesApi.fetchItem(updatedAt),
  ).data.table;
}

export function useStageTable(): StageTable {
  return useGameResourceQuery(
    gameResourceQueryKeys.stage,
    GAME_RESOURCE_CACHE_KEYS.stage,
    stageTableSchema,
    stageBundled,
    (updatedAt) => getQueryDependencies().gameResourcesApi.fetchStage(updatedAt),
  ).data.table;
}
