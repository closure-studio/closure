import * as v from 'valibot';

import { contributorsSchema } from '@/schemas/contributor';
import { mockContributors } from './contributors-fixture';

describe('Contributors fixture', () => {
  it('keeps the complete canonical fixture valid', () => {
    expect(v.safeParse(contributorsSchema, mockContributors).success).toBe(true);
  });
});
