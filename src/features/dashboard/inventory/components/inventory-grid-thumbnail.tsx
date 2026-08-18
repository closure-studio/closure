import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { XStack, styled } from 'tamagui';

import inventoryGridFilterLarge from '@/assets/images/inventory/grid-filter-large.webp';
import inventoryGridFilterSmall from '@/assets/images/inventory/grid-filter-small.webp';
import type { LayoutSize } from '@/schemas/layout-size';
import { INVENTORY_GRID_THUMBNAIL_SIZE } from '../inventory-grid-thumbnail-config';

const INVENTORY_GRID_FILTER_IMAGES = {
  small: inventoryGridFilterSmall,
  large: inventoryGridFilterLarge,
} as const satisfies Record<LayoutSize, number>;

const InventoryGridThumbnailFrame = styled(XStack, {
  name: 'InventoryGridThumbnail',
  position: 'relative',
  shrink: 0,
  items: 'center',
  justify: 'center',
  overflow: 'hidden',
  rounded: 999,
  variants: {
    layoutSize: {
      small: {
        width: INVENTORY_GRID_THUMBNAIL_SIZE.small,
        height: INVENTORY_GRID_THUMBNAIL_SIZE.small,
        ml: '$1.5',
        my: '$0.5',
      },
      large: {
        width: INVENTORY_GRID_THUMBNAIL_SIZE.large,
        height: INVENTORY_GRID_THUMBNAIL_SIZE.large,
      },
    },
  } as const,
});

export const InventoryGridThumbnail = memo(function InventoryGridThumbnail({
  itemId,
  label,
  layoutSize,
  uri,
}: {
  itemId: string;
  label: string;
  layoutSize: LayoutSize;
  uri: string;
}) {
  return (
    <InventoryGridThumbnailFrame
      testID={`inventory-item-image-circle-${itemId}`}
      layoutSize={layoutSize}
    >
      <Image
        testID={`inventory-item-image-thumbnail-${itemId}`}
        source={uri}
        recyclingKey={itemId}
        cachePolicy="memory-disk"
        contentFit="contain"
        accessibilityLabel={label}
        style={StyleSheet.absoluteFill}
      />
      <Image
        testID={`inventory-item-image-filter-${itemId}`}
        source={INVENTORY_GRID_FILTER_IMAGES[layoutSize]}
        cachePolicy="memory"
        contentFit="fill"
        style={StyleSheet.absoluteFill}
        aria-hidden
      />
    </InventoryGridThumbnailFrame>
  );
});
