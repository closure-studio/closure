import * as v from 'valibot';

import { apiNodeSchema } from '@/schemas/api-node';
import { contributorsSchema } from '@/schemas/contributor';
import { userAccountSchema } from '@/schemas/user-account';
import {
  mockContributors,
  mockApiNodes,
  mockFailedApiNode,
  mockUserAccount,
} from './settings-mocks';

describe('settings mocks', () => {
  it('keeps every API Node fixture valid', () => {
    for (const apiNode of [...mockApiNodes, mockFailedApiNode]) {
      expect(v.safeParse(apiNodeSchema, apiNode).success).toBe(true);
    }
  });

  it('keeps the User Account fixture valid', () => {
    expect(v.safeParse(userAccountSchema, mockUserAccount).success).toBe(true);
  });

  it('keeps the complete contributors fixture valid', () => {
    expect(v.safeParse(contributorsSchema, mockContributors).success).toBe(true);
  });
});
