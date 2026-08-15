import * as v from 'valibot';

import { itemIdSchema } from '@/schemas/game-data';
import { nonNegativeIntegerSchema } from '@/schemas/primitives';

export const inventorySchema = v.record(itemIdSchema, nonNegativeIntegerSchema);

export type Inventory = v.InferOutput<typeof inventorySchema>;
