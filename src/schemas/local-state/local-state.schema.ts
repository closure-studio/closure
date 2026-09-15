import * as v from 'valibot';

import { userSessionSchema } from '@/schemas/auth';
import { apiNodeIdSchema } from '@/schemas/api-node';

export const requestModeSchema = v.picklist(['remote', 'mock']);
export type RequestMode = v.InferOutput<typeof requestModeSchema>;

export const persistedStoreStateSchema = v.object({
  requestMode: v.optional(requestModeSchema, 'remote'),
  auth: v.object({ session: v.nullable(userSessionSchema) }),
  selectedApiNodeId: apiNodeIdSchema,
});

export type PersistedStoreState = v.InferOutput<typeof persistedStoreStateSchema>;
