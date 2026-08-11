import * as v from 'valibot';

import { layoutSizeSchema } from './layout-size.schema';

describe('layoutSizeSchema', () => {
  it.each(['small', 'large'] as const)('accepts the %s Layout Size', (layoutSize) => {
    expect(v.safeParse(layoutSizeSchema, layoutSize).success).toBe(true);
  });

  it.each(['compact', null, {}])('rejects malformed Layout Size input', (input) => {
    expect(v.safeParse(layoutSizeSchema, input).success).toBe(false);
  });
});
