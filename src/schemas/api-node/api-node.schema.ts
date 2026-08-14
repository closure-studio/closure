import * as v from 'valibot';

export const apiNodeIdSchema = v.picklist(['domestic', 'overseas']);
export const apiNodeOutcomeSchema = v.picklist(['reachable', 'unreachable']);

export const apiNodeSchema = v.object({
  id: apiNodeIdSchema,
  description: v.pipe(v.string(), v.minLength(1)),
  latencyMs: v.pipe(v.number(), v.integer(), v.minValue(0)),
  outcome: apiNodeOutcomeSchema,
});

export type ApiNodeId = v.InferOutput<typeof apiNodeIdSchema>;
export type ApiNode = v.InferOutput<typeof apiNodeSchema>;
