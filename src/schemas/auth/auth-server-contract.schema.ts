import * as v from 'valibot';

const nonNegativeIntegerSchema = v.pipe(v.number(), v.integer(), v.minValue(0));
const integerSchema = v.pipe(v.number(), v.integer());
const nonBlankStringSchema = v.pipe(v.string(), v.minLength(1));

export const authResponseCodeSchema = v.union([
  v.literal(0),
  v.literal(1),
  v.literal(2),
]);

export const authTokenDataSchema = v.object({
  available_slot: v.optional(nonNegativeIntegerSchema),
  token: nonBlankStringSchema,
});

export const authServerJwtClaimsSchema = v.object({
  createdAt: nonNegativeIntegerSchema,
  email: v.pipe(v.string(), v.email()),
  exp: nonNegativeIntegerSchema,
  isAdmin: v.boolean(),
  permission: nonNegativeIntegerSchema,
  slot: nonNegativeIntegerSchema,
  status: v.union([v.literal(-1), v.literal(0), v.literal(1), v.literal(2)]),
  uuid: nonBlankStringSchema,
});

export const authServerAdminUserSchema = v.object({
  CreatedTs: nonNegativeIntegerSchema,
  ID: nonNegativeIntegerSchema,
  IP: v.string(),
  Password: v.string(),
  Permission: nonNegativeIntegerSchema,
  QQ: v.string(),
  Slot: nonNegativeIntegerSchema,
  Status: integerSchema,
  UUID: nonBlankStringSchema,
  UpdateTs: nonNegativeIntegerSchema,
  UserEmail: v.pipe(v.string(), v.email()),
});

const responseMessageEntry = {
  message: v.string(),
};

const failureResponseSchema = v.object({
  ...responseMessageEntry,
  code: v.literal(0),
  data: v.null_(),
});

export const authTokenResponseSchema = v.union([
  failureResponseSchema,
  v.object({
    ...responseMessageEntry,
    code: v.literal(1),
    data: authTokenDataSchema,
  }),
]);

export const authAdminUsersResponseSchema = v.union([
  failureResponseSchema,
  v.object({
    ...responseMessageEntry,
    code: v.literal(1),
    data: v.array(authServerAdminUserSchema),
  }),
]);

export const authStringResponseSchema = v.union([
  failureResponseSchema,
  v.object({
    ...responseMessageEntry,
    code: v.literal(1),
    data: v.string(),
  }),
  v.object({
    ...responseMessageEntry,
    code: v.literal(2),
    data: v.null_(),
  }),
]);

export const authEmptyResponseSchema = v.union([
  failureResponseSchema,
  v.object({
    ...responseMessageEntry,
    code: v.literal(1),
    data: v.null_(),
  }),
]);

export const authServerLoginRequestSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: nonBlankStringSchema,
});

export const authServerRegistrationRequestSchema = v.object({
  code: nonBlankStringSchema,
  email: v.pipe(v.string(), v.email()),
  noise: nonBlankStringSchema,
  password: nonBlankStringSchema,
  sign: nonBlankStringSchema,
});

export const authServerPasswordResetRequestSchema = v.object({
  code: nonBlankStringSchema,
  email: v.pipe(v.string(), v.email()),
  newPasswd: nonBlankStringSchema,
});

export const authServerPasswordUpdateRequestSchema = v.object({
  currentPasswd: nonBlankStringSchema,
  email: v.pipe(v.string(), v.email()),
  newPasswd: nonBlankStringSchema,
});

export const authServerLinuxDoLoginRequestSchema = v.object({
  code: nonBlankStringSchema,
  redirect_uri: v.pipe(v.string(), v.url()),
});

export const authServerAdminUserQuerySchema = v.object({
  value: v.pipe(v.string(), v.trim(), v.minLength(1)),
});

export const authServerUserPermissionUpdateSchema = v.object({
  permission: nonNegativeIntegerSchema,
  uuid: nonBlankStringSchema,
});

export const authServerRegistrationCodeRequestSchema = v.object({
  email: v.pipe(v.string(), v.email()),
});

export const authServerAdminLoginRequestSchema = v.object({ uuid: nonBlankStringSchema });
export type AuthResponseCode = v.InferOutput<typeof authResponseCodeSchema>;
export type AuthTokenData = v.InferOutput<typeof authTokenDataSchema>;
export type AuthServerJwtClaims = v.InferOutput<typeof authServerJwtClaimsSchema>;
export type AuthServerAdminUser = v.InferOutput<typeof authServerAdminUserSchema>;
export type AuthTokenResponse = v.InferOutput<typeof authTokenResponseSchema>;
export type AuthAdminUsersResponse = v.InferOutput<typeof authAdminUsersResponseSchema>;
export type AuthStringResponse = v.InferOutput<typeof authStringResponseSchema>;
export type AuthEmptyResponse = v.InferOutput<typeof authEmptyResponseSchema>;
export type AuthServerPasswordResetRequest = v.InferOutput<typeof authServerPasswordResetRequestSchema>;
export type AuthServerPasswordUpdateRequest = v.InferOutput<typeof authServerPasswordUpdateRequestSchema>;
export type AuthServerLinuxDoLoginRequest = v.InferOutput<typeof authServerLinuxDoLoginRequestSchema>;
export type AuthServerLoginRequest = v.InferOutput<typeof authServerLoginRequestSchema>;
export type AuthServerRegistrationRequest = v.InferOutput<typeof authServerRegistrationRequestSchema>;
export type AuthServerAdminUserQuery = v.InferOutput<typeof authServerAdminUserQuerySchema>;
export type AuthServerUserPermissionUpdate = v.InferOutput<typeof authServerUserPermissionUpdateSchema>;
export type AuthServerRegistrationCodeRequest = v.InferOutput<typeof authServerRegistrationCodeRequestSchema>;
export type AuthServerAdminLoginRequest = v.InferOutput<typeof authServerAdminLoginRequestSchema>;
