import * as v from 'valibot';

import { nonEmptyStringSchema } from '@/schemas/primitives';

export const characterIdSchema = nonEmptyStringSchema;

export const characterTableEntrySchema = v.object({
  name: nonEmptyStringSchema,
  rarity: v.picklist([0, 1, 2, 3, 4, 5]),
});

export const characterTableSchema = v.pipe(
  v.record(characterIdSchema, characterTableEntrySchema),
  v.check((table) => Object.keys(table).length > 0, 'The Character Table must not be empty.'),
);

export type CharacterId = v.InferOutput<typeof characterIdSchema>;
export type CharacterTableEntry = v.InferOutput<typeof characterTableEntrySchema>;
export type CharacterTable = v.InferOutput<typeof characterTableSchema>;
