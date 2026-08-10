import * as v from 'valibot';

import { itemTableSchema } from './item-table.schema';

describe('Item Table schema', () => {
  it('accepts the resource table shape keyed by item ID', () => {
    const result = v.safeParse(itemTableSchema, {
      '31034': {
        name: '晶体电路',
        icon: 'MTL_SL_OC4',
        description: '现代源石电子产业的核心产品。',
      },
      '3233': { name: '重装双芯片', icon: 'MTL_ASC_TNK3' },
      EPGS_COIN: { name: '寻访参数模型', icon: 'EPGS_COIN' },
      item_without_description: { name: '无描述物品', icon: 'NO_DESCRIPTION', description: null },
    });

    expect(result.success).toBe(true);
  });

  it.each([
    { '31034': { name: '', icon: 'MTL_SL_OC4' } },
    { '31034': { name: '晶体电路', icon: '' } },
    { '31034': { name: '晶体电路' } },
    { '31034': { name: '晶体电路', icon: 31034 } },
    { '31034': { name: '晶体电路', icon: 'MTL_SL_OC4', description: '' } },
    { '': { name: '无效 ID', icon: 'invalid' } },
  ])('rejects malformed item table data', (input) => {
    expect(v.safeParse(itemTableSchema, input).success).toBe(false);
  });
});
