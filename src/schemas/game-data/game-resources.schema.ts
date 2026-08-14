import * as v from 'valibot';

export const gameResourceUpdatedAtSchema = v.pipe(v.string(), v.isoTimestamp());

export const bundledGameResourcesSchema = v.object({
  character: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
  item: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
  stage: v.object({ updatedAt: gameResourceUpdatedAtSchema }),
});

export type BundledGameResources = v.InferOutput<typeof bundledGameResourcesSchema>;
