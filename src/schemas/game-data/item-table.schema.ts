import * as v from 'valibot';

export const itemIdSchema = v.pipe(v.string(), v.minLength(1));

export const itemTableItemSchema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  icon: v.pipe(v.string(), v.minLength(1)),
  description: v.nullish(v.pipe(v.string(), v.minLength(1))),
});

export const itemTableSchema = v.pipe(
  v.record(itemIdSchema, itemTableItemSchema),
  v.check((table) => Object.keys(table).length > 0, 'The Item Table must not be empty.'),
);

export type ItemId = v.InferOutput<typeof itemIdSchema>;
export type ItemTableItem = v.InferOutput<typeof itemTableItemSchema>;
export type ItemTable = v.InferOutput<typeof itemTableSchema>;
