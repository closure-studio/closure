import * as v from 'valibot';

import { characterTableSchema } from './character-table.schema';
import { itemTableSchema } from './item-table.schema';
import { stageTableSchema } from './stage-table.schema';

export const gameResourceUpdatedAtSchema = v.pipe(v.string(), v.isoTimestamp());

export const bundledGameResourcesSchema = v.object({
  character: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
  item: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
  stage: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
});

export const gameResourcesStateSchema = v.object({
  character: v.nullable(v.object({
    table: characterTableSchema,
    updatedAt: gameResourceUpdatedAtSchema,
  })),
  checkedAt: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0))),
  item: v.nullable(v.object({
    table: itemTableSchema,
    updatedAt: gameResourceUpdatedAtSchema,
  })),
  stage: v.nullable(v.object({
    table: stageTableSchema,
    updatedAt: gameResourceUpdatedAtSchema,
  })),
});

export type BundledGameResources = v.InferOutput<typeof bundledGameResourcesSchema>;
export type GameResourcesState = v.InferOutput<typeof gameResourcesStateSchema>;
