import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { tamaguiConfig } from '../../../tamagui.config';
import { itemTableSchema } from '@/schemas/game-data';
import { inventorySchema } from '@/schemas/game-account';
import { InventoryView, getInventoryGridLayout } from './components/inventory-view';
import { getItemImageUrl } from './item-image';

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

function gridLayoutEvent(width: number) {
  return {
    nativeEvent: { layout: { width, height: 0, x: 0, y: 0 } },
  };
}

describe('getInventoryGridLayout', () => {
  it.each([
    { containerWidth: 0, columnCount: 1, itemWidth: undefined },
    { containerWidth: -16, columnCount: 1, itemWidth: undefined },
    { containerWidth: 127, columnCount: 1, itemWidth: 127 },
    { containerWidth: 128, columnCount: 1, itemWidth: 128 },
    { containerWidth: 262, columnCount: 1, itemWidth: 262 },
    { containerWidth: 263, columnCount: 2, itemWidth: 128 },
    { containerWidth: 320, columnCount: 2, itemWidth: 156.5 },
    { containerWidth: 397, columnCount: 2, itemWidth: 195 },
    { containerWidth: 398, columnCount: 3, itemWidth: 128 },
    { containerWidth: 400, columnCount: 3, itemWidth: 386 / 3 },
    { containerWidth: 532, columnCount: 3, itemWidth: 518 / 3 },
    { containerWidth: 533, columnCount: 4, itemWidth: 128 },
    { containerWidth: 667, columnCount: 4, itemWidth: 161.5 },
    { containerWidth: 668, columnCount: 5, itemWidth: 128 },
    { containerWidth: 720, columnCount: 5, itemWidth: 138.4 },
    { containerWidth: 802, columnCount: 5, itemWidth: 154.8 },
    { containerWidth: 803, columnCount: 6, itemWidth: 128 },
    { containerWidth: 937, columnCount: 6, itemWidth: 902 / 6 },
    { containerWidth: 938, columnCount: 7, itemWidth: 128 },
    { containerWidth: 1072, columnCount: 7, itemWidth: 1030 / 7 },
    { containerWidth: 1073, columnCount: 8, itemWidth: 128 },
    { containerWidth: 1104, columnCount: 8, itemWidth: 1055 / 8 },
  ])(
    'computes %i columns and the matching item width for container width %i',
    ({ containerWidth, columnCount, itemWidth }) => {
      const layout = getInventoryGridLayout(containerWidth, 7);

      expect(layout.columnCount).toBe(columnCount);
      if (itemWidth === undefined) {
        expect(layout.itemWidth).toBeUndefined();
      } else if (Number.isInteger(itemWidth)) {
        expect(layout.itemWidth).toBe(itemWidth);
      } else {
        expect(layout.itemWidth).toBeCloseTo(itemWidth, 5);
      }
    },
  );
});

describe('InventoryView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders known inventory entries, selects an item, and skips unknown IDs', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-grid-columns-1')).toBeTruthy();
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
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-content-31034').props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 10,
        paddingRight: 10,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-name-31034').props.style)).toEqual(
      expect.objectContaining({ textAlign: 'right' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-quantity-31034').props.style)).toEqual(
      expect.objectContaining({ textAlign: 'right' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({
        height: 40,
        width: 40,
        maxWidth: '100%',
        borderTopLeftRadius: 999,
        borderTopRightRadius: 999,
        borderBottomLeftRadius: 999,
        borderBottomRightRadius: 999,
      }),
    );
    expect(screen.getByTestId('inventory-selection-top-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-top-right-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-right-31034')).toBeTruthy();
    const inventoryImage = screen.getByTestId('inventory-item-image-31034', {
      includeHiddenElements: true,
    });
    expect(inventoryImage.props.source).toEqual(expect.objectContaining({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    }));
    expect(inventoryImage.props.opacity).toBe(0);
    expect(readSvgText(screen.getByTestId('inventory-item-image-fallback-character-31034', {
      includeHiddenElements: true,
    }))).toBe('晶');
    await fireEvent(inventoryImage, 'load');
    expect(screen.queryByTestId('inventory-item-image-fallback-character-31034')).toBeNull();
    expect(inventoryImage.props.opacity).toBe(1);

    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(true);

    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(false);
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(readSvgText(screen.getByTestId('inventory-preview-name'))).toBe('寻访参数模型');
  });

  it('reflows matrix columns from the measured container width', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-columns-1'), 'layout', gridLayoutEvent(320));
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-columns-2'), 'layout', gridLayoutEvent(400));
    expect(screen.getByTestId('inventory-grid-columns-3')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-columns-3'), 'layout', gridLayoutEvent(720));
    expect(screen.getByTestId('inventory-grid-columns-5')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-columns-5'), 'layout', gridLayoutEvent(1104));
    expect(screen.getByTestId('inventory-grid-columns-8')).toBeTruthy();
  });

  it('keeps selection and loaded artwork across a width round trip', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-columns-1'), 'layout', gridLayoutEvent(320));
    const firstImage = screen.getByTestId('inventory-item-image-31034', {
      includeHiddenElements: true,
    });
    await fireEvent(firstImage, 'load');
    expect(firstImage.props.opacity).toBe(1);
    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );

    await fireEvent(screen.getByTestId('inventory-grid-columns-2'), 'layout', gridLayoutEvent(1104));
    expect(screen.getByTestId('inventory-grid-columns-8')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 1055 / 8 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 1055 / 8 }),
    );
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    const loadedImage = screen.getByTestId('inventory-item-image-31034', {
      includeHiddenElements: true,
    });
    expect(loadedImage.props.opacity).toBe(1);
    expect(screen.queryByTestId('inventory-item-image-fallback-character-31034')).toBeNull();

    await fireEvent(screen.getByTestId('inventory-grid-columns-8'), 'layout', gridLayoutEvent(320));
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(screen.getByTestId('inventory-item-image-31034', {
      includeHiddenElements: true,
    }).props.opacity).toBe(1);
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).not.toEqual(
      expect.objectContaining({ flexGrow: 1 }),
    );
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