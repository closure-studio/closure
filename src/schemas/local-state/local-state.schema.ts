import * as v from 'valibot';

import { userSessionSchema } from '@/schemas/auth';
import { apiNodeIdSchema } from '@/schemas/api-node';

export const persistedStoreStateSchema = v.object({
  activeGameAccountId: v.nullable(v.string()),
  auth: v.object({ session: v.nullable(userSessionSchema) }),
  selectedApiNodeId: apiNodeIdSchema,
});

export type PersistedStoreState = v.InferOutput<typeof persistedStoreStateSchema>;
