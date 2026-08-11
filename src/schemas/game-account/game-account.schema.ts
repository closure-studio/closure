import * as v from 'valibot';

import { activityTimelineEntrySchema } from './activity-timeline-entry.schema';
import { inventorySchema } from './inventory.schema';
import { operatorSchema } from './operator.schema';

const gameAccountColorSchema = v.picklist(['primary', 'warning', 'muted']);
const gameAccountStatSchema = v.object({
  label: v.string(),
  value: v.string(),
  trend: v.string(),
  warn: v.optional(v.boolean()),
});

export const gameAccountSchema = v.object({
  id: v.string(),
  callsign: v.string(),
  uid: v.string(),
  server: v.string(),
  avatar: v.string(),
  color: gameAccountColorSchema,
  doctorLevel: v.number(),
  exp: v.tuple([v.number(), v.number()]),
  ap: v.tuple([v.number(), v.number()]),
  apRecoverAt: v.string(),
  lmd: v.number(),
  orundum: v.number(),
  originium: v.number(),
  recruitTickets: v.number(),
  drTitle: v.string(),
  progress: v.string(),
  online: v.string(),
  baseMood: v.number(),
  factoryLoad: v.number(),
  trainingLoad: v.number(),
  stats: v.array(gameAccountStatSchema),
  operators: v.array(operatorSchema),
  inventory: inventorySchema,
  activityTimeline: v.array(activityTimelineEntrySchema),
});

export type GameAccount = v.InferOutput<typeof gameAccountSchema>;
