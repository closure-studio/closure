import * as v from 'valibot';

import { mmkvStateStorage } from '@/lib/mmkv';
import { gameResourceUpdatedAtSchema } from '@/schemas/game-data';

export const GAME_RESOURCE_CACHE_KEYS = {
  character: 'closure.game-resources.character',
  item: 'closure.game-resources.item',
  stage: 'closure.game-resources.stage',
} as const;

export type CachedGameResource<T> = {
  table: T;
  updatedAt: string;
};

function cachedGameResourceSchema<T>(tableSchema: v.GenericSchema<unknown, T>) {
  return v.object({
    table: tableSchema,
    updatedAt: gameResourceUpdatedAtSchema,
  });
}

export function loadCachedGameResource<T>(
  key: string,
  tableSchema: v.GenericSchema<unknown, T>,
): CachedGameResource<T> | null {
  const raw = mmkvStateStorage.getItem(key);
  if (typeof raw !== 'string') return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    const result = v.safeParse(cachedGameResourceSchema(tableSchema), parsed);
    return result.success ? result.output : null;
  } catch {
    return null;
  }
}

export function saveCachedGameResource<T>(
  key: string,
  value: CachedGameResource<T>,
): void {
  mmkvStateStorage.setItem(key, JSON.stringify(value));
}
