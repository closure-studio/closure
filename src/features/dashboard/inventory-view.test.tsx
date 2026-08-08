import { render } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { tamaguiConfig } from '../../../tamagui.config';
import { itemTableSchema } from '@/schemas/game-data';
import { inventorySchema } from '@/schemas/game-account';
import { InventoryView } from './components/inventory-view';

jest.mock('tamagui', () => {
  const actual = jest.requireActual<typeof import('tamagui')>('tamagui');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
  };
});

const itemTable = v.parse(itemTableSchema, {
  '31034': { name: '晶体电路', icon: 'MTL_SL_OC4' },
  EPGS_COIN: { name: '寻访参数模型', icon: 'EPGS_COIN' },
});

const inventory = v.parse(inventorySchema, {
  '31034': 131,
  EPGS_COIN: 0,
  unknown_item: 4,
});

describe('InventoryView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders known inventory entries and skips unknown IDs', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-item-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-item-EPGS_COIN')).toBeTruthy();
    expect(screen.getByText('晶体电路')).toBeTruthy();
    expect(screen.getByText('131')).toBeTruthy();
    expect(screen.queryByTestId('inventory-item-unknown_item')).toBeNull();
  });
});
