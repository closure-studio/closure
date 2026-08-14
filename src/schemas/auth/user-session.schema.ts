import * as v from 'valibot';

export const USER_PERMISSION = {
  communityHelper: 1 << 3,
  createGame: 1 << 4,
  deleteGame: 1 << 7,
  queryGame: 1 << 5,
  superAdmin: 1 << 0,
  ticketCreate: 1 << 1,
  ticketUpdate: 1 << 2,
  updateGame: 1 << 6,
} as const;

const sessionPrincipalStatusSchema = v.picklist([
  'banned',
  'active',
  'manually-verified',
]);

const sessionPrincipalSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  id: v.pipe(v.string(), v.minLength(1)),
  permission: v.pipe(v.number(), v.integer(), v.minValue(0)),
  registeredAt: v.pipe(v.string(), v.isoTimestamp()),
  slotLimit: v.pipe(v.number(), v.integer(), v.minValue(0)),
  status: sessionPrincipalStatusSchema,
});

export const userSessionSchema = v.object({
  accessToken: v.pipe(v.string(), v.minLength(1)),
  availableSlots: v.nullable(v.pipe(v.number(), v.integer(), v.minValue(0))),
  expiresAt: v.pipe(v.string(), v.isoTimestamp()),
  principal: sessionPrincipalSchema,
});

export type SessionPrincipal = v.InferOutput<typeof sessionPrincipalSchema>;
export type UserSession = v.InferOutput<typeof userSessionSchema>;
