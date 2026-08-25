import { Image, type ImageProps } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { XStack, styled } from 'tamagui';

import itemArtworkFilterLarge from '@/assets/images/inventory/grid-filter-large.webp';
import itemArtworkFilterSmall from '@/assets/images/inventory/grid-filter-small.webp';
import type { LayoutSize } from '@/schemas/layout-size';
import { ITEM_ARTWORK_SIZE } from './item-artwork-config';

const ITEM_ARTWORK_FILTER_IMAGES = {
  small: itemArtworkFilterSmall,
  large: itemArtworkFilterLarge,
} as const satisfies Record<LayoutSize, number>;

const ItemArtworkFrame = styled(XStack, {
  name: 'ItemArtwork',
  position: 'relative',
  shrink: 0,
  items: 'center',
  justify: 'center',
  overflow: 'hidden',
  rounded: 999,
  variants: {
    layoutSize: {
      small: {
        width: ITEM_ARTWORK_SIZE.small,
        height: ITEM_ARTWORK_SIZE.small,
      },
      large: {
        width: ITEM_ARTWORK_SIZE.large,
        height: ITEM_ARTWORK_SIZE.large,
      },
    },
  } as const,
});

export type ItemArtworkProps = {
  accessibilityLabel: string;
  layoutSize: LayoutSize;
  recyclingKey: string;
  source: Exclude<ImageProps['source'], undefined>;
  testID?: string;
};

export const ItemArtwork = memo(function ItemArtwork({
  accessibilityLabel,
  layoutSize,
  recyclingKey,
  source,
  testID,
}: ItemArtworkProps) {
  const imageTestID = testID ? `${testID}-image` : undefined;
  const filterTestID = testID ? `${testID}-filter` : undefined;

  return (
    <ItemArtworkFrame testID={testID} layoutSize={layoutSize}>
      <Image
        testID={imageTestID}
        source={source}
        recyclingKey={recyclingKey}
        cachePolicy="memory-disk"
        contentFit="contain"
        accessibilityLabel={accessibilityLabel}
        style={StyleSheet.absoluteFill}
      />
      <Image
        testID={filterTestID}
        source={ITEM_ARTWORK_FILTER_IMAGES[layoutSize]}
        cachePolicy="memory"
        contentFit="fill"
        style={StyleSheet.absoluteFill}
        aria-hidden
      />
    </ItemArtworkFrame>
  );
});
