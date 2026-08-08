import { itemTable } from './item-table';
import { inventoryFixture } from './mocks/inventory';

describe('bundled item table', () => {
  it('loads the official resource entries used by the inventory', () => {
    expect(itemTable['31034']).toEqual({ name: '晶体电路', icon: 'MTL_SL_OC4' });
    expect(itemTable['3233']).toEqual({ name: '重装双芯片', icon: 'MTL_ASC_TNK3' });
    expect(itemTable.EPGS_COIN).toEqual({ name: '寻访参数模型', icon: 'EPGS_COIN' });
    expect(Object.keys(itemTable).length).toBeGreaterThan(1000);
    expect(Object.keys(inventoryFixture).every((itemId) => itemTable[itemId] !== undefined)).toBe(true);
  });
});
