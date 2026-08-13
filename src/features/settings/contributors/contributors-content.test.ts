import * as v from 'valibot';

import { contributorsSchema } from '@/schemas/contributor';
import { contributorsContent } from './contributors-content';

describe('Contributors static content', () => {
  it('keeps the complete canonical content valid', () => {
    expect(v.safeParse(contributorsSchema, contributorsContent).success).toBe(true);
  });
});
