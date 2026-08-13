import * as v from 'valibot';

import { characterTableSchema } from './character-table.schema';

describe('Character Table schema', () => {
  it('accepts character metadata keyed by character ID', () => {
    expect(
      v.safeParse(characterTableSchema, {
        character_alpha: { name: '测试干员甲', rarity: 4 },
        character_beta: { name: '测试干员乙', rarity: 5 },
      }).success,
    ).toBe(true);
  });

  it.each([
    {},
    { '': { name: '测试干员', rarity: 4 } },
    { character_alpha: { name: '', rarity: 4 } },
    { character_alpha: { name: '测试干员', rarity: -1 } },
    { character_alpha: { name: '测试干员', rarity: 6 } },
    { character_alpha: { name: '测试干员', rarity: 4.5 } },
  ])('rejects malformed character metadata', (input) => {
    expect(v.safeParse(characterTableSchema, input).success).toBe(false);
  });
});
