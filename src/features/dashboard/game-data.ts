import { parse } from 'valibot';

import rawCharacterTable from '@/assets/data/character_table.json';
import rawItemTable from '@/assets/data/item_table.json';
import rawStageTable from '@/assets/data/stage_table.json';
import {
  characterTableSchema,
  itemTableSchema,
  stageTableSchema,
} from '@/schemas/game-data';
import type { CharacterTable } from '@/schemas/game-data';

export { getStageDisplayLabel, getStageDisplayParts } from '@/utils/stage-display';

export const bundledCharacterTable = parse(characterTableSchema, rawCharacterTable);
export const bundledItemTable = parse(itemTableSchema, rawItemTable);
export const bundledStageTable = parse(stageTableSchema, rawStageTable);

export function getCharacterDisplayName(table: CharacterTable, characterId: string) {
  return table[characterId]?.name ?? characterId;
}
