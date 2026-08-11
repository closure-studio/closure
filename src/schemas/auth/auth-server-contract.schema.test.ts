import * as v from 'valibot';

import {
  authAdminUsersResponseSchema,
  authEmptyResponseSchema,
  authServerAdminLoginRequestSchema,
  authServerAdminUserQuerySchema,
  authServerJwtClaimsSchema,
  authServerLinuxDoLoginRequestSchema,
  authServerLoginRequestSchema,
  authServerPasswordResetRequestSchema,
  authServerPasswordUpdateRequestSchema,
  authServerRegistrationCodeRequestSchema,
  authServerRegistrationRequestSchema,
  authServerUserPermissionUpdateSchema,
  authStringResponseSchema,
  authTokenResponseSchema,
} from './auth-server-contract.schema';

const serverUser = {
  CreatedTs: 1_736_838_600,
  ID: 1,
  IP: '192.0.2.1',
  Password: 'server-only-hash',
  Permission: 17,
  QQ: '100000001',
  Slot: 3,
  Status: 1,
  UUID: 'user-1',
  UpdateTs: 1_746_144_000,
  UserEmail: 'doctor@rhodes.is',
};

describe('auth server contract schemas', () => {
  it('accepts the closureStudio token response and JWT claims', () => {
    expect(v.safeParse(authTokenResponseSchema, {
      code: 1,
      data: { available_slot: 2, token: 'jwt' },
      message: 'success',
    }).success).toBe(true);
    expect(v.safeParse(authServerJwtClaimsSchema, {
      createdAt: 1_736_838_600,
      email: 'doctor@rhodes.is',
      exp: 4_102_444_800,
      isAdmin: false,
      permission: 17,
      slot: 3,
      status: 1,
      uuid: 'user-1',
    }).success).toBe(true);
  });

  it('accepts admin, string, and empty envelopes', () => {
    expect(v.safeParse(authAdminUsersResponseSchema, {
      code: 1, data: [serverUser], message: 'success',
    }).success).toBe(true);
    expect(v.safeParse(authStringResponseSchema, {
      code: 1, data: 'verify-code', message: 'success',
    }).success).toBe(true);
    expect(v.safeParse(authEmptyResponseSchema, {
      code: 1, data: null, message: 'success',
    }).success).toBe(true);
  });

  it('preserves server-specific request field names at the wire seam', () => {
    expect(v.safeParse(authServerLoginRequestSchema, {
      email: 'doctor@rhodes.is', password: 'secret',
    }).success).toBe(true);
    expect(v.safeParse(authServerRegistrationRequestSchema, {
      code: '123456', email: 'doctor@rhodes.is', noise: 'noise', password: 'secret', sign: 'sign',
    }).success).toBe(true);
    expect(v.safeParse(authServerPasswordResetRequestSchema, {
      code: '123456', email: 'doctor@rhodes.is', newPasswd: 'new-secret',
    }).success).toBe(true);
    expect(v.safeParse(authServerPasswordUpdateRequestSchema, {
      currentPasswd: 'current', email: 'doctor@rhodes.is', newPasswd: 'new-secret',
    }).success).toBe(true);
    expect(v.safeParse(authServerLinuxDoLoginRequestSchema, {
      code: 'oauth-code', redirect_uri: 'https://example.com/auth/callback',
    }).success).toBe(true);
    expect(v.safeParse(authServerAdminUserQuerySchema, { value: 'doctor' }).success).toBe(true);
    expect(v.safeParse(authServerUserPermissionUpdateSchema, {
      permission: 3, uuid: 'user-1',
    }).success).toBe(true);
    expect(v.safeParse(authServerRegistrationCodeRequestSchema, {
      email: 'doctor@rhodes.is',
    }).success).toBe(true);
    expect(v.safeParse(authServerAdminLoginRequestSchema, { uuid: 'user-1' }).success).toBe(true);
  });

  it('accepts a typed null data envelope for business failures', () => {
    expect(v.safeParse(authTokenResponseSchema, {
      code: 0, data: null, message: 'invalid credentials',
    }).success).toBe(true);
    expect(v.safeParse(authAdminUsersResponseSchema, {
      code: 0, data: null, message: 'permission denied',
    }).success).toBe(true);
    expect(v.safeParse(authStringResponseSchema, {
      code: 2, data: null, message: 'already bound',
    }).success).toBe(true);
  });

  it('rejects malformed and incomplete responses', () => {
    expect(v.safeParse(authTokenResponseSchema, {
      code: 9, data: { token: '' }, message: 'invalid',
    }).success).toBe(false);
    expect(v.safeParse(authTokenResponseSchema, {
      code: 1, message: 'missing data',
    }).success).toBe(false);
    expect(v.safeParse(authAdminUsersResponseSchema, {
      code: 1, data: [{ ...serverUser, UserEmail: 'invalid' }], message: 'invalid',
    }).success).toBe(false);
  });
});
