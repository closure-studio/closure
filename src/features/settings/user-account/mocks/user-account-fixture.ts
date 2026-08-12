import type { UserAccount } from '@/schemas/user-account';

export const mockUserAccount = {
  id: 'user-closure-01',
  email: 'doctor@rhodes.is',
  registeredAt: '2025-01-14T08:30:00.000Z',
  role: 'member',
} satisfies UserAccount;
