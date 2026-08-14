import type { UserSession } from '@/schemas/auth';
import { USER_PERMISSION } from '@/schemas/auth';

export const MOCK_AUTH_VALUES = {
  activeEmail: 'doctor@rhodes.is',
  activeToken: 'mock-active-session-token',
  adminEmail: 'admin@closure.test',
  adminToken: 'mock-admin-session-token',
  bannedEmail: 'banned@closure.test',
  bannedToken: 'mock-banned-session-token',
  password: 'closure-password',
} as const;

const sessionExpiry = '2100-01-01T00:00:00.000Z';

export const mockActiveSession = {
  accessToken: MOCK_AUTH_VALUES.activeToken,
  availableSlots: 2,
  expiresAt: sessionExpiry,
  principal: {
    email: MOCK_AUTH_VALUES.activeEmail,
    id: 'user-closure-01',
    permission: USER_PERMISSION.createGame | USER_PERMISSION.queryGame | USER_PERMISSION.updateGame,
    registeredAt: '2025-01-14T08:30:00.000Z',
    slotLimit: 3,
    status: 'active',
  },
} satisfies UserSession;

export const mockBannedSession = {
  accessToken: MOCK_AUTH_VALUES.bannedToken,
  availableSlots: 0,
  expiresAt: sessionExpiry,
  principal: {
    email: MOCK_AUTH_VALUES.bannedEmail,
    id: 'user-closure-banned',
    permission: 0,
    registeredAt: '2024-08-09T04:00:00.000Z',
    slotLimit: 0,
    status: 'banned',
  },
} satisfies UserSession;

export const mockAdminSession = {
  accessToken: MOCK_AUTH_VALUES.adminToken,
  availableSlots: 5,
  expiresAt: sessionExpiry,
  principal: {
    email: MOCK_AUTH_VALUES.adminEmail,
    id: 'user-closure-admin',
    permission: Object.values(USER_PERMISSION).reduce((permission, value) => permission | value, 0),
    registeredAt: '2024-01-01T00:00:00.000Z',
    slotLimit: 5,
    status: 'manually-verified',
  },
} satisfies UserSession;
