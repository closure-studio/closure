import { itemTable } from './item-table';
import { inventoryFixture } from './mocks/inventory';

describe('bundled item table', () => {
  it('loads the official resource entries used by the inventory', () => {
    expect(itemTable['31034']?.name).toBe('晶体电路');
    expect(itemTable['31034']?.icon).toBe('MTL_SL_OC4');
    expect(itemTable['31034']).toEqual({
      name: '晶体电路',
      icon: 'MTL_SL_OC4',
      description: '现代源石电子产业的核心产品，常见于泰拉诸国使用的大量电子产品中，晶体电路的大量使用也是泰拉工业现代化的体现。',
    });
    expect(itemTable['3233']?.name).toBe('重装双芯片');
    expect(itemTable['3233']?.icon).toBe('MTL_ASC_TNK3');
    expect(itemTable.EPGS_COIN?.name).toBe('寻访参数模型');
    expect(itemTable.EPGS_COIN?.icon).toBe('EPGS_COIN');
    expect(Object.keys(itemTable).length).toBeGreaterThan(1000);
    expect(Object.keys(inventoryFixture).every((itemId) => itemTable[itemId] !== undefined)).toBe(true);
  });
});
