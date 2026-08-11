import * as v from 'valibot';

import { mockActiveSession } from '@/features/auth/api/mock-auth-fixtures';
import { adminUserSchema, userSessionSchema } from './user-session.schema';

describe('userSessionSchema', () => {
  it('accepts the trusted mock User Session', () => {
    expect(v.safeParse(userSessionSchema, mockActiveSession).success).toBe(true);
  });

  it.each([
    { ...mockActiveSession, accessToken: '' },
    { ...mockActiveSession, expiresAt: 'tomorrow' },
    { ...mockActiveSession, principal: { ...mockActiveSession.principal, status: 'unknown' } },
    { ...mockActiveSession, principal: { ...mockActiveSession.principal, slotLimit: -1 } },
  ])('rejects malformed session data', (session) => {
    expect(v.safeParse(userSessionSchema, session).success).toBe(false);
  });

  it('does not admit the server Password field to normalized admin users', () => {
    const adminUser = v.parse(adminUserSchema, {
      createdAt: '2025-01-01T00:00:00.000Z',
      email: 'admin@example.com',
      id: 'admin-1',
      ipAddress: '192.0.2.1',
      password: 'must-not-enter-domain',
      permission: 1,
      qq: '',
      slotLimit: 1,
      status: 'active',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });

    expect(adminUser).not.toHaveProperty('password');
  });
});
