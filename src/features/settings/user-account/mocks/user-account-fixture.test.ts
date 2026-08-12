import * as v from 'valibot';

import { userAccountSchema } from '@/schemas/user-account';
import { mockUserAccount } from './user-account-fixture';

describe('User Account fixture', () => {
  it('keeps the canonical fixture valid', () => {
    expect(v.safeParse(userAccountSchema, mockUserAccount).success).toBe(true);
  });
});
