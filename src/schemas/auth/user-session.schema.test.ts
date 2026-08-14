import * as v from 'valibot';

import { mockActiveSession } from '@/mocks/auth';
import { userSessionSchema } from './user-session.schema';

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
});
