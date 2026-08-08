import * as v from 'valibot';

import { itemIdSchema } from '@/schemas/game-data';

const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));

export const inventorySchema = v.record(itemIdSchema, nonNegativeIntegerSchema);

export type Inventory = v.InferOutput<typeof inventorySchema>;
