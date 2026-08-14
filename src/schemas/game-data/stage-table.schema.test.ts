import * as v from 'valibot';

import { stageTableSchema } from './stage-table.schema';

describe('Stage Table schema', () => {
  it('accepts stage metadata keyed by stage ID', () => {
    expect(
      v.safeParse(stageTableSchema, {
        stage_alpha: {
          name: '测试关卡甲',
          code: 'TEST-1',
          ap: 6,
          items: ['item_alpha'],
        },
        stage_beta: {
          name: '测试关卡乙',
          code: 'TEST-2',
          ap: 0,
          items: [],
        },
      }).success,
    ).toBe(true);
  });

  it.each([
    {},
    { '': { name: '测试关卡', code: 'TEST-1', ap: 6, items: [] } },
    { stage_alpha: { name: '', code: 'TEST-1', ap: 6, items: [] } },
    { stage_alpha: { name: '测试关卡', code: '', ap: 6, items: [] } },
    { stage_alpha: { name: '测试关卡', code: 'TEST-1', ap: -1, items: [] } },
    { stage_alpha: { name: '测试关卡', code: 'TEST-1', ap: 6.5, items: [] } },
    { stage_alpha: { name: '测试关卡', code: 'TEST-1', ap: 6, items: [''] } },
  ])('rejects malformed stage metadata', (input) => {
    expect(v.safeParse(stageTableSchema, input).success).toBe(false);
  });
});
