import * as v from 'valibot';

import { inventorySchema } from './inventory.schema';

describe('Inventory schema', () => {
  it('accepts numeric and symbolic item IDs', () => {
    expect(v.safeParse(inventorySchema, {
      '31034': 131,
      '3233': 0,
      EPGS_COIN: 11342,
      mod_unlock_token: 386,
    }).success).toBe(true);
  });

  it.each([
    { '31034': -1 },
    { '31034': 1.5 },
    { '': 1 },
  ])('rejects invalid inventory quantities or IDs', (input) => {
    expect(v.safeParse(inventorySchema, input).success).toBe(false);
  });
});
