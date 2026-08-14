import * as v from 'valibot';

import { itemTableSchema } from './item-table.schema';

describe('Item Table schema', () => {
  it('accepts the resource table shape keyed by item ID', () => {
    const result = v.safeParse(itemTableSchema, {
      item_alpha: {
        name: '测试物品甲',
        icon: 'TEST_ITEM_ALPHA',
        description: '用于验证资源表结构的测试物品。',
      },
      item_beta: { name: '测试物品乙', icon: 'TEST_ITEM_BETA' },
      item_without_description: { name: '无描述测试物品', icon: 'TEST_NO_DESCRIPTION', description: null },
    });

    expect(result.success).toBe(true);
  });

  it.each([
    {},
    { item_alpha: { name: '', icon: 'TEST_ITEM' } },
    { item_alpha: { name: '测试物品', icon: '' } },
    { item_alpha: { name: '测试物品' } },
    { item_alpha: { name: '测试物品', icon: 1 } },
    { item_alpha: { name: '测试物品', icon: 'TEST_ITEM', description: '' } },
    { '': { name: '无效 ID', icon: 'invalid' } },
  ])('rejects malformed item table data', (input) => {
    expect(v.safeParse(itemTableSchema, input).success).toBe(false);
  });
});
