import * as v from 'valibot';

import { nonEmptyStringSchema, nonNegativeIntegerSchema } from '@/schemas/primitives';

export const stageIdSchema = nonEmptyStringSchema;

export const stageTableEntrySchema = v.object({
  name: nonEmptyStringSchema,
  code: nonEmptyStringSchema,
  ap: nonNegativeIntegerSchema,
  items: v.array(nonEmptyStringSchema),
});

export const stageTableSchema = v.pipe(
  v.record(stageIdSchema, stageTableEntrySchema),
  v.check((table) => Object.keys(table).length > 0, 'The Stage Table must not be empty.'),
);

export type StageId = v.InferOutput<typeof stageIdSchema>;
export type StageTableEntry = v.InferOutput<typeof stageTableEntrySchema>;
export type StageTable = v.InferOutput<typeof stageTableSchema>;
