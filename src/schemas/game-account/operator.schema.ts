import * as v from 'valibot';

import { raritySchema } from './rarity.schema';

const eliteSchema = v.picklist([0, 1, 2]);

export const operatorSchema = v.pipe(
  v.object({
    id: v.string(),
    name: v.string(),
    codename: v.string(),
    class: v.string(),
    rarity: raritySchema,
    level: v.number(),
    maxLevel: v.number(),
    elite: eliteSchema,
    potential: v.number(),
    trust: v.number(),
    skillLevel: v.number(),
    proficiency: v.tuple([v.number(), v.number(), v.number()]),
  }),
  v.check((operator) => operator.level <= operator.maxLevel),
);

export type Operator = v.InferOutput<typeof operatorSchema>;
