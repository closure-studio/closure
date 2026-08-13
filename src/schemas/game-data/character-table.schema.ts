import * as v from 'valibot';

const nonBlankStringSchema = v.pipe(v.string(), v.minLength(1));

export const characterIdSchema = nonBlankStringSchema;

export const characterTableEntrySchema = v.object({
  name: nonBlankStringSchema,
  rarity: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(5)),
});

export const characterTableSchema = v.pipe(
  v.record(characterIdSchema, characterTableEntrySchema),
  v.check((table) => Object.keys(table).length > 0, 'The Character Table must not be empty.'),
);

export type CharacterId = v.InferOutput<typeof characterIdSchema>;
export type CharacterTableEntry = v.InferOutput<typeof characterTableEntrySchema>;
export type CharacterTable = v.InferOutput<typeof characterTableSchema>;
