import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { G } from 'react-native-svg';

import { AvatarFilter } from '@/components';

const CIRCULAR_ARTWORK_RADIUS = 999;

// Grid cells keep the static filter overlay (wash + scanlines) but not the
// feather/mask — the feather stays preview-only to keep cells lightweight.
export const InventoryGridThumbnail = memo(function InventoryGridThumbnail({
  itemId,
  label,
  size,
  testIdPrefix,
  uri,
}: {
  itemId: string;
  label: string;
  size: number;
  testIdPrefix: string;
  uri: string;
}) {
  return (
    <View
      testID={`${testIdPrefix}-circle-${itemId}`}
      style={[styles.circle, { width: size, height: size }]}
    >
      <Image
        testID={`${testIdPrefix}-thumbnail-${itemId}`}
        source={uri}
        recyclingKey={itemId}
        cachePolicy="memory-disk"
        contentFit="contain"
        accessibilityLabel={label}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G testID={`${testIdPrefix}-filter-${itemId}`} aria-hidden>
          <AvatarFilter testID={`${testIdPrefix}-filter-svg-${itemId}`} />
        </G>
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  circle: {
    borderRadius: CIRCULAR_ARTWORK_RADIUS,
    overflow: 'hidden',
  },
});
