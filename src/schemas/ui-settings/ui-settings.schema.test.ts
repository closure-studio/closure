import * as v from 'valibot';

import { uiSettingsSchema } from './ui-settings.schema';

describe('uiSettingsSchema', () => {
  it.each(['small', 'large'] as const)('accepts the %s Layout Size', (layoutSize) => {
    expect(v.safeParse(uiSettingsSchema, { layoutSize }).success).toBe(true);
  });

  it.each([
    {},
    { layoutSize: 'compact' },
    { layoutSize: null },
  ])('rejects malformed UI Settings', (input) => {
    expect(v.safeParse(uiSettingsSchema, input).success).toBe(false);
  });
});
