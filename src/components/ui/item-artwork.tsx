import { Image, type ImageProps } from 'expo-image';
import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { XStack, styled, useMedia } from 'tamagui';

import itemArtworkFilterLarge from '@/assets/images/inventory/grid-filter-large.webp';
import itemArtworkFilterSmall from '@/assets/images/inventory/grid-filter-small.webp';
export const ITEM_ARTWORK_SIZE = 48;
export const ITEM_ARTWORK_LARGE_SIZE = 104;

const ItemArtworkFrame = styled(XStack, {
  name: 'ItemArtwork',
  position: 'relative',
  shrink: 0,
  items: 'center',
  justify: 'center',
  overflow: 'hidden',
  rounded: 999,
  width: ITEM_ARTWORK_SIZE,
  height: ITEM_ARTWORK_SIZE,
  $large: {
    width: ITEM_ARTWORK_LARGE_SIZE,
    height: ITEM_ARTWORK_LARGE_SIZE,
  },
});

export type ItemArtworkProps = {
  accessibilityLabel: string;
  recyclingKey: string;
  source: Exclude<ImageProps['source'], undefined>;
  testID?: string;
};

export const ItemArtwork = memo(function ItemArtwork({
  accessibilityLabel,
  recyclingKey,
  source,
  testID,
}: ItemArtworkProps) {
  const { large } = useMedia();
  const imageTestID = testID ? `${testID}-image` : undefined;
  const filterTestID = testID ? `${testID}-filter` : undefined;

  return (
    <ItemArtworkFrame testID={testID}>
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
        source={large ? itemArtworkFilterLarge : itemArtworkFilterSmall}
        cachePolicy="memory"
        contentFit="fill"
        style={StyleSheet.absoluteFill}
        aria-hidden
      />
    </ItemArtworkFrame>
  );
});
