import * as v from 'valibot';
export const idServerLoginSchema = v.object({
  token: v.pipe(v.string(), v.minLength(1)),
  available_slot: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))),
});
export const idServerClaimsSchema = v.object({
  email: v.pipe(v.string(), v.email()), uuid: v.pipe(v.string(), v.minLength(1)),
  status: v.picklist([-1, 0, 1, 2]),
  permission: v.pipe(v.number(), v.integer(), v.minValue(0)),
  exp: v.pipe(v.number(), v.integer(), v.minValue(0)),
  createdAt: v.pipe(v.number(), v.integer(), v.minValue(0)),
});
