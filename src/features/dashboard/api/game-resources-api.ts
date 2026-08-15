import { fetch } from 'expo/fetch';
import * as v from 'valibot';

import { ARK_RESOURCES_ORIGIN } from '@/constants/api';
import {
  characterTableSchema,
  gameResourceUpdatedAtSchema,
  itemTableSchema,
  stageTableSchema,
} from '@/schemas/game-data';
import type {
  CharacterTable,
  ItemTable,
  StageTable,
} from '@/schemas/game-data';

export type GameResourceResult<T> =
  | { kind: 'not-modified' }
  | { kind: 'updated'; table: T; updatedAt: string }
  | { kind: 'unavailable' };

export interface GameResourcesApi {
  fetchCharacter(updatedAt: string | null): Promise<GameResourceResult<CharacterTable>>;
  fetchItem(updatedAt: string | null): Promise<GameResourceResult<ItemTable>>;
  fetchStage(updatedAt: string | null): Promise<GameResourceResult<StageTable>>;
}

export type GameResourceResponse = {
  headers: { get(name: string): string | null };
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
};

export type GameResourceFetch = (
  input: string,
  init: { headers: Record<string, string> },
) => Promise<GameResourceResponse>;

const GAME_RESOURCE_BASE_URL = `${ARK_RESOURCES_ORIGIN}/data`;
const NOT_MODIFIED_STATUS = 304;

async function fetchTable<T>(
  fileName: string,
  updatedAt: string | null,
  schema: v.GenericSchema<unknown, T>,
  request: GameResourceFetch,
): Promise<GameResourceResult<T>> {
  try {
    const headers: Record<string, string> = {};
    if (updatedAt !== null) {
      headers['If-Modified-Since'] = new Date(updatedAt).toUTCString();
    }
    const response = await request(`${GAME_RESOURCE_BASE_URL}/${fileName}`, { headers });
    if (response.status === NOT_MODIFIED_STATUS) return { kind: 'not-modified' };
    if (!response.ok) return { kind: 'unavailable' };

    const header = response.headers.get('Last-Modified');
    if (!header) return { kind: 'unavailable' };
    const parsedUpdatedAt = v.safeParse(
      gameResourceUpdatedAtSchema,
      new Date(header).toISOString(),
    );
    if (!parsedUpdatedAt.success) return { kind: 'unavailable' };

    const parsedTable = v.safeParse(schema, await response.json());
    if (!parsedTable.success) return { kind: 'unavailable' };
    return {
      kind: 'updated',
      table: parsedTable.output,
      updatedAt: parsedUpdatedAt.output,
    };
  } catch {
    return { kind: 'unavailable' };
  }
}

export class RemoteGameResourcesApi implements GameResourcesApi {
  constructor(private readonly request: GameResourceFetch = fetch) {}

  fetchCharacter(updatedAt: string | null) {
    return fetchTable('character_table.json', updatedAt, characterTableSchema, this.request);
  }

  fetchItem(updatedAt: string | null) {
    return fetchTable('item_table.json', updatedAt, itemTableSchema, this.request);
  }

  fetchStage(updatedAt: string | null) {
    return fetchTable('stage_table.json', updatedAt, stageTableSchema, this.request);
  }
}
