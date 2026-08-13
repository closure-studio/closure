import { parse } from 'valibot';

import rawCharacterTable from '@/assets/data/character_table.json';
import rawBundledGameResources from '@/assets/data/game_resources.json';
import rawItemTable from '@/assets/data/item_table.json';
import rawStageTable from '@/assets/data/stage_table.json';
import {
  bundledGameResourcesSchema,
  characterTableSchema,
  itemTableSchema,
  stageTableSchema,
} from '@/schemas/game-data';
import type { CharacterTable, StageTable } from '@/schemas/game-data';

export const bundledCharacterTable = parse(characterTableSchema, rawCharacterTable);
export const bundledGameResources = parse(bundledGameResourcesSchema, rawBundledGameResources);
export const bundledItemTable = parse(itemTableSchema, rawItemTable);
export const bundledStageTable = parse(stageTableSchema, rawStageTable);

export function getCharacterDisplayName(table: CharacterTable, characterId: string) {
  return table[characterId]?.name ?? characterId;
}

export function getStageDisplayLabel(table: StageTable, stageId: string, unavailable: string) {
  const stage = table[stageId];
  if (stage) return `${stage.code} · ${stage.name}`;
  return stageId || unavailable;
}
