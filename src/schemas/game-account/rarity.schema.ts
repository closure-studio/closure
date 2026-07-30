import * as v from 'valibot';

export const raritySchema = v.picklist([3, 4, 5, 6]);

export type Rarity = v.InferOutput<typeof raritySchema>;
