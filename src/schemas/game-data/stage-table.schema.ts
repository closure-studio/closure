import * as v from 'valibot';

const nonBlankStringSchema = v.pipe(v.string(), v.minLength(1));
const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

export const stageIdSchema = nonBlankStringSchema;

export const stageTableEntrySchema = v.object({
  name: nonBlankStringSchema,
  code: nonBlankStringSchema,
  ap: nonNegativeIntegerSchema,
  items: v.array(nonBlankStringSchema),
});

export const stageTableSchema = v.pipe(
  v.record(stageIdSchema, stageTableEntrySchema),
  v.check((table) => Object.keys(table).length > 0, 'The Stage Table must not be empty.'),
);

export type StageId = v.InferOutput<typeof stageIdSchema>;
export type StageTableEntry = v.InferOutput<typeof stageTableEntrySchema>;
export type StageTable = v.InferOutput<typeof stageTableSchema>;
