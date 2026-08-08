import * as v from 'valibot';

export const itemIdSchema = v.pipe(v.string(), v.minLength(1));

export const itemTableItemSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  icon: v.pipe(v.string(), v.minLength(1)),
});

export const itemTableSchema = v.record(itemIdSchema, itemTableItemSchema);

export type ItemId = v.InferOutput<typeof itemIdSchema>;
export type ItemTableItem = v.InferOutput<typeof itemTableItemSchema>;
export type ItemTable = v.InferOutput<typeof itemTableSchema>;
