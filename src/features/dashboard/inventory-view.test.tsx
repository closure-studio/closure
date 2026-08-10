import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { tamaguiConfig } from '../../../tamagui.config';
import { itemTableSchema } from '@/schemas/game-data';
import { inventorySchema } from '@/schemas/game-account';
import { InventoryView, getInventoryColumnCount } from './components/inventory-view';
import { getItemImageUrl } from './item-image';

let mockCompactMedia = false;

jest.mock('tamagui', () => {
  const actual = jest.requireActual<typeof import('tamagui')>('tamagui');
  return {
    ...actual,
    useMedia: () => ({ 'max-md': mockCompactMedia }),
  };
});

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
  };
});

const itemTable = v.parse(itemTableSchema, {
  '31034': {
    name: '晶体电路',
    icon: 'MTL_SL_OC4',
    description: '现代源石电子产业的核心产品，常见于泰拉诸国使用的大量电子产品中。',
  },
  EPGS_COIN: {
    name: '寻访参数模型',
    icon: 'EPGS_COIN',
  },
});

const inventory = v.parse(inventorySchema, {
  '31034': 131,
  EPGS_COIN: 0,
  unknown_item: 4,
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readSvgText(value: unknown): string | undefined {
  if (!isRecord(value)) return undefined;

  const props = value.props;
  if (!isRecord(props)) return undefined;

  const children = props.children;
  if (typeof children === 'string') return children;
  if (!isRecord(children)) return undefined;

  const childProps = children.props;
  if (!isRecord(childProps)) return undefined;

  return typeof childProps.children === 'string' ? childProps.children : undefined;
}

describe('InventoryView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockCompactMedia = false;
  });

  afterEach(() => {
    jest.useRealTimers();
    mockCompactMedia = false;
  });

  it('renders known inventory entries, selects an item, and skips unknown IDs', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-item-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-item-EPGS_COIN')).toBeTruthy();
    expect(screen.getByTestId('inventory-preview-details')).toBeTruthy();
    expect(screen.getByTestId('inventory-preview-name')).toBeTruthy();
    expect(screen.getByTestId('inventory-preview-description')).toBeTruthy();
    expect(screen.getByTestId('inventory-item-info-31034')).toBeTruthy();
    expect(screen.getAllByText('晶体电路')).toHaveLength(2);
    expect(screen.getAllByText('x131')).toHaveLength(2);
    expect(screen.getByText('x0')).toBeTruthy();
    expect(screen.queryByTestId('inventory-item-unknown_item')).toBeNull();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).not.toEqual(
      expect.objectContaining({ height: 156 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-artwork-31034').props.style)).not.toEqual(
      expect.objectContaining({ height: 94 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-content-31034').props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 13,
        paddingRight: 13,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-name-31034').props.style)).toEqual(
      expect.objectContaining({ textAlign: 'right' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-quantity-31034').props.style)).toEqual(
      expect.objectContaining({ textAlign: 'right' }),
    );
    expect(screen.getByTestId('inventory-selection-top-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-top-right-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-right-31034')).toBeTruthy();
    const inventoryImage = screen.getByTestId('inventory-item-image-svg-image-31034', {
      includeHiddenElements: true,
    });
    expect(inventoryImage.props.src).toEqual({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    });
    expect(inventoryImage.props.opacity).toBe(0);
    expect(readSvgText(screen.getByTestId('inventory-item-image-fallback-character-31034', {
      includeHiddenElements: true,
    }))).toBe('晶');
    await fireEvent(inventoryImage, 'load');
    expect(screen.queryByTestId('inventory-item-image-fallback-31034')).toBeNull();
    expect(inventoryImage.props.opacity).toBe(1);
    expect(screen.getByTestId('inventory-item-image-filter-31034', {
      includeHiddenElements: true,
    })).toBeTruthy();
    expect(screen.getByTestId('inventory-item-image-feather-31034', {
      includeHiddenElements: true,
    })).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({
        aspectRatio: 1,
        borderTopLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomLeftRadius: 999,
        borderBottomRightRadius: 999,
      }),
    );

    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(true);

    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(false);
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);

  });

  it('renders the mobile inventory with a compact two-column matrix and preview', async () => {
    mockCompactMedia = true;
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-matrix')).toBeTruthy();
    expect(screen.getByTestId('inventory-preview-details')).toBeTruthy();
    expect(screen.getByTestId('inventory-preview-description')).toBeTruthy();
    expect(screen.getByTestId('inventory-item-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-item-info-31034')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).not.toEqual(
      expect.objectContaining({ height: 132 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-artwork-31034').props.style)).not.toEqual(
      expect.objectContaining({ height: 64 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-content-31034').props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({ width: 40, maxWidth: '100%' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({
        aspectRatio: 1,
        borderTopLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomLeftRadius: 999,
        borderBottomRightRadius: 999,
      }),
    );
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();

    expect(getInventoryColumnCount(320, true, 7)).toBe(2);
    expect(getInventoryColumnCount(400, true, 7)).toBe(3);
  });

  it('renders an empty state when no inventory item is known', async () => {
    const emptyInventory = v.parse(inventorySchema, { unknown_item: 4 });
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={emptyInventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-empty')).toBeTruthy();
  });

  it('builds item image URLs from the table icon filename', () => {
    expect(getItemImageUrl('MTL_SKILL3')).toBe(
      'https://ark-resource.arknights.app/assets/items/MTL_SKILL3.webp',
    );
    expect(getItemImageUrl('icon with spaces')).toBe(
      'https://ark-resource.arknights.app/assets/items/icon%20with%20spaces.webp',
    );
  });
});
