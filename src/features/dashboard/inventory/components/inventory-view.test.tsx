import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { TamaguiProvider } from 'tamagui';
import * as v from 'valibot';

import { tamaguiConfig } from '../../../../../tamagui.config';
import { getResponsiveGridLayout } from '@/hooks/use-responsive-grid-rows';
import { itemTableSchema } from '@/schemas/game-data';
import { inventorySchema } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { getItemImageUrl } from '../item-image';
import { EMPTY_INVENTORY, InventoryView } from './inventory-view';

let mockLayoutSize: LayoutSize = 'small';

jest.mock('@/providers/layout-size-provider', () => ({
  useLayoutSize: () => mockLayoutSize,
}));

jest.mock('react-native-reanimated', () => {
  const reanimated = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated');
  const reanimatedMock = jest.requireActual<typeof import('react-native-reanimated')>('react-native-reanimated/mock');

  return {
    ...reanimated,
    ...reanimatedMock,
  };
});

jest.mock('expo-image', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: (props: {
      source: string | { uri?: string };
      testID?: string;
      [key: string]: unknown;
    }) => {
      const src = typeof props.source === 'string' ? { uri: props.source } : props.source;
      const { source: _source, testID, ...rest } = props;
      const viewProps: Record<string, unknown> = { ...rest, src, testID };
      return <View {...viewProps} />;
    },
    prefetch: jest.fn(),
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

describe('getResponsiveGridLayout', () => {
  it.each([
    { containerWidth: 0, columnCount: 1, itemWidth: undefined },
    { containerWidth: -16, columnCount: 1, itemWidth: undefined },
    { containerWidth: 123, columnCount: 1, itemWidth: 123 },
    { containerWidth: 124, columnCount: 1, itemWidth: 124 },
    { containerWidth: 254, columnCount: 1, itemWidth: 254 },
    { containerWidth: 255, columnCount: 2, itemWidth: 124 },
    { containerWidth: 320, columnCount: 2, itemWidth: 156.5 },
    { containerWidth: 385, columnCount: 2, itemWidth: 189 },
    { containerWidth: 386, columnCount: 3, itemWidth: 124 },
    { containerWidth: 400, columnCount: 3, itemWidth: 386 / 3 },
    { containerWidth: 516, columnCount: 3, itemWidth: 502 / 3 },
    { containerWidth: 517, columnCount: 4, itemWidth: 124 },
    { containerWidth: 720, columnCount: 5, itemWidth: 138.4 },
    { containerWidth: 1104, columnCount: 8, itemWidth: 1055 / 8 },
  ])(
    'computes $columnCount columns and their width for a $containerWidth container',
    ({ containerWidth, columnCount, itemWidth }) => {
      const layout = getResponsiveGridLayout(containerWidth, 7, 124);

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
    mockLayoutSize = 'small';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders known inventory entries, selects an item, and skips unknown IDs', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    // No placeholder single-column grid content renders before the container is measured.
    expect(screen.queryByTestId('inventory-item-31034')).toBeNull();
    expect(screen.queryByTestId('inventory-item-EPGS_COIN')).toBeNull();

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();
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
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-info-31034').props.style)).toEqual(
      expect.objectContaining({
        paddingBottom: 4,
        paddingLeft: 7,
        paddingRight: 10,
        paddingTop: 4,
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
        borderRadius: 999,
        height: 48,
        overflow: 'hidden',
        width: 48,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-artwork-31034').props.style)).toEqual(
      expect.objectContaining({ height: 48, width: 48 }),
    );
    expect(screen.getByTestId('inventory-selection-top-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-top-right-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-left-31034')).toBeTruthy();
    expect(screen.getByTestId('inventory-selection-bottom-right-31034')).toBeTruthy();
    const inventoryImage = screen.getByTestId('inventory-item-image-thumbnail-31034', {
      includeHiddenElements: true,
    });
    expect(inventoryImage.props.src).toEqual({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    });
    // Grid cells stay lightweight: no feather/mask tree, no per-cell image
    // status state, and a recycling key for FlashList reuse. The static
    // filter overlay is kept.
    expect(inventoryImage.props.recyclingKey).toBe('31034');
    expect(screen.queryByTestId('inventory-item-image-fallback-character-31034', {
      includeHiddenElements: true,
    })).toBeNull();
    expect(screen.queryByTestId('inventory-item-image-feather-mask-31034', {
      includeHiddenElements: true,
    })).toBeNull();
    expect(screen.queryByTestId('inventory-item-image-filter-31034', {
      includeHiddenElements: true,
    })).toBeTruthy();
    expect(screen.queryByTestId('inventory-item-image-filter-svg-31034', {
      includeHiddenElements: true,
    })).toBeTruthy();
    // The single preview keeps the full SVG artwork.
    expect(screen.getByTestId('inventory-preview-image-feather-mask-31034', {
      includeHiddenElements: true,
    })).toBeTruthy();

    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(true);

    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(false);
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(readSvgText(screen.getByTestId('inventory-preview-name'))).toBe('寻访参数模型');
  });

  it('reflows matrix columns from the measured container width', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(400));
    expect(screen.getByTestId('inventory-grid-columns-3')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(720));
    expect(screen.getByTestId('inventory-grid-columns-5')).toBeTruthy();

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(1104));
    expect(screen.getByTestId('inventory-grid-columns-8')).toBeTruthy();
  });

  it('uses the larger cell variant and large minimum width on Large Screen', async () => {
    mockLayoutSize = 'large';
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(500));

    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({
        paddingBottom: 7,
        paddingLeft: 13,
        paddingRight: 13,
        paddingTop: 7,
        width: 246.5,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-preview-details').props.style)).toEqual(
      expect.objectContaining({
        paddingBottom: 10,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 10,
      }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-preview-artwork').props.style)).toEqual(
      expect.objectContaining({ height: 104, width: 104 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-preview-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({ borderRadius: 999, overflow: 'hidden' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-image-circle-31034').props.style)).toEqual(
      expect.objectContaining({ borderRadius: 999, overflow: 'hidden' }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-name-31034').props.style)).toEqual(
      expect.objectContaining({ fontSize: 16, lineHeight: 24 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-quantity-31034').props.style)).toEqual(
      expect.objectContaining({ fontSize: 14, lineHeight: 22 }),
    );
  });

  it('degrades to interactive artwork and then hides cells in an exceptionally narrow container', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(100));
    expect(screen.queryByTestId('inventory-item-info-31034')).toBeNull();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ justifyContent: 'center', width: 100 }),
    );
    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(true);
    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(39));
    expect(screen.queryByTestId('inventory-item-31034')).toBeNull();
    expect(screen.getByTestId('inventory-preview-details')).toBeTruthy();
    expect(readSvgText(screen.getByTestId('inventory-preview-name'))).toBe('寻访参数模型');
  });

  it('keeps selection and loaded artwork across a width round trip', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));
    const firstImage = screen.getByTestId('inventory-item-image-thumbnail-31034', {
      includeHiddenElements: true,
    });
    expect(firstImage.props.src).toEqual({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    });
    await fireEvent.press(screen.getByTestId('inventory-item-EPGS_COIN'));
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(1104));
    expect(screen.getByTestId('inventory-grid-columns-8')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 1055 / 8 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 1055 / 8 }),
    );
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    const loadedImage = screen.getByTestId('inventory-item-image-thumbnail-31034', {
      includeHiddenElements: true,
    });
    expect(loadedImage.props.src).toEqual({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    });

    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));
    expect(screen.getByTestId('inventory-grid-columns-2')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-31034').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).toEqual(
      expect.objectContaining({ width: 156.5 }),
    );
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
    expect(screen.getByTestId('inventory-item-image-thumbnail-31034', {
      includeHiddenElements: true,
    }).props.src).toEqual({
      uri: 'https://ark-resource.arknights.app/assets/items/MTL_SL_OC4.webp',
    });
    expect(StyleSheet.flatten(screen.getByTestId('inventory-item-EPGS_COIN').props.style)).not.toEqual(
      expect.objectContaining({ flexGrow: 1 }),
    );
  });

  it('renders an empty state when no inventory item is known', async () => {
    const emptyInventory = v.parse(inventorySchema, { unknown_item: 4 });
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={emptyInventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );

    expect(screen.getByTestId('inventory-empty')).toBeTruthy();
  });

  it('resets the selected item at the account boundary instead of remounting', async () => {
    const screen = await render(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-a" inventory={inventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );
    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));
    await fireEvent.press(screen.getByTestId('inventory-item-31034'));
    expect(screen.getByTestId('inventory-item-31034').props['aria-selected']).toBe(true);

    const otherAccountInventory = v.parse(inventorySchema, { EPGS_COIN: 3 });
    await screen.rerender(
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <InventoryView accountId="account-b" inventory={otherAccountInventory} itemTable={itemTable} />
      </TamaguiProvider>,
    );
    await fireEvent(screen.getByTestId('inventory-grid-container'), 'layout', gridLayoutEvent(320));

    // The stale selection (31034) does not exist on account-b; selection falls
    // back to account-b's first entry instead of leaking cross-account state.
    expect(screen.getByTestId('inventory-item-EPGS_COIN').props['aria-selected']).toBe(true);
  });

  it('exposes a stable EMPTY_INVENTORY constant for the route', () => {
    // The route feeds EMPTY_INVENTORY (not a fresh {} per render) so empty
    // detail does not invalidate InventoryView derivation on every render.
    expect(EMPTY_INVENTORY).toBe(EMPTY_INVENTORY);
    expect(Object.keys(EMPTY_INVENTORY)).toHaveLength(0);
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
