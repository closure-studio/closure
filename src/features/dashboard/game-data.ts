import { parse } from 'valibot';

import rawCharacterTable from '@/assets/data/character_table.json';
import rawItemTable from '@/assets/data/item_table.json';
import rawStageTable from '@/assets/data/stage_table.json';
import {
  characterTableSchema,
  itemTableSchema,
  stageTableSchema,
} from '@/schemas/game-data';
import type { CharacterTable, StageTable } from '@/schemas/game-data';

export const bundledCharacterTable = parse(characterTableSchema, rawCharacterTable);
export const bundledItemTable = parse(itemTableSchema, rawItemTable);
export const bundledStageTable = parse(stageTableSchema, rawStageTable);

export function getCharacterDisplayName(table: CharacterTable, characterId: string) {
  return table[characterId]?.name ?? characterId;
}

export function getStageDisplayParts(table: StageTable, stageId: string, unavailable: string) {
  const stage = table[stageId];
  if (stage) return { title: stage.code, subtitle: stage.name };
  return { title: stageId || unavailable, subtitle: undefined };
}

export function getStageDisplayLabel(table: StageTable, stageId: string, unavailable: string) {
  const display = getStageDisplayParts(table, stageId, unavailable);
  return display.subtitle ? `${display.title} · ${display.subtitle}` : display.title;
}
