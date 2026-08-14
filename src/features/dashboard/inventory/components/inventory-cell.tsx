import { memo } from 'react';
import { XStack, YStack, styled } from 'tamagui';

import { MonoText, TerminalText } from '@/components';
import type { ItemTableItem } from '@/schemas/game-data';
import type { LayoutSize } from '@/schemas/layout-size';
import { InventoryArtwork } from './inventory-artwork';

export const INVENTORY_CELL_MIN_WIDTH_TOKEN = {
  small: '$11',
  large: '$16',
} as const;

export const INVENTORY_CELL_ARTWORK_SIZE_TOKEN = {
  small: '$4.5',
  large: '$10',
} as const;
export type InventoryEntry = {
  item: ItemTableItem;
  itemId: string;
  quantity: number;
};

const InventoryCellFrame = styled(XStack, {
  name: 'InventoryCell',
  position: 'relative',
  minW: 0,
  items: 'center',
  justify: 'space-between',
  cursor: 'pointer',
  focusStyle: {
    outlineColor: '$appAccent',
    outlineStyle: 'solid',
    outlineWidth: 2,
  },
  hoverStyle: {
    opacity: 0.86,
  },
  pressStyle: {
    opacity: 0.68,
  },
  variants: {
    imageOnly: {
      true: { justify: 'center' },
      false: {},
    },
    selected: {
      true: { bg: '$appAccentSubtle' },
      false: {},
    },
    layoutSize: {
      small: { gap: '$0', px: '$0', py: '$0' },
      large: { gap: '$3', px: '$3', py: '$2' },
    },
  } as const,
  defaultVariants: {
    imageOnly: false,
    selected: false,
    layoutSize: 'small',
  },
});

export function formatInventoryQuantity(quantity: number): string {
  return `x${quantity.toLocaleString()}`;
}

function SelectionCorners({ itemId }: { itemId: string }) {
  return (
    <>
      <YStack testID={`inventory-selection-top-left-${itemId}`} position="absolute" t={0} l={0} width={18} height={18} borderTopWidth={2} borderLeftWidth={2} borderColor="$appMaterial" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-top-right-${itemId}`} position="absolute" t={0} r={0} width={18} height={18} borderTopWidth={2} borderRightWidth={2} borderColor="$appAccent" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-bottom-left-${itemId}`} position="absolute" b={0} l={0} width={18} height={18} borderBottomWidth={2} borderLeftWidth={2} borderColor="$appAccent" style={{ pointerEvents: 'none' }} />
      <YStack testID={`inventory-selection-bottom-right-${itemId}`} position="absolute" b={0} r={0} width={18} height={18} borderBottomWidth={2} borderRightWidth={2} borderColor="$appMaterial" style={{ pointerEvents: 'none' }} />
    </>
  );
}

export const InventoryCell = memo(function InventoryCell({
  entry,
  imageOnly,
  itemWidth,
  onSelect,
  selected,
  size,
}: {
  entry: InventoryEntry;
  imageOnly: boolean;
  itemWidth: number | undefined;
  onSelect: (itemId: string) => void;
  selected: boolean;
  size: LayoutSize;
}) {
  const artworkSize = size === 'small' ? 48 : 104;

  return (
    <InventoryCellFrame
      testID={`inventory-item-${entry.itemId}`}
      role="button"
      aria-label={`${entry.item.name}, ${entry.quantity.toLocaleString()}`}
      aria-selected={selected}
      onPress={() => onSelect(entry.itemId)}
      imageOnly={imageOnly}
      selected={selected}
      layoutSize={size}
      width={itemWidth ?? '100%'}
    >
      <XStack
        testID={`inventory-item-artwork-${entry.itemId}`}
        width={INVENTORY_CELL_ARTWORK_SIZE_TOKEN[size]}
        height={INVENTORY_CELL_ARTWORK_SIZE_TOKEN[size]}
        ml={size === 'small' ? '$1.5' : '$0'}
        my={size === 'small' ? '$0.5' : '$0'}
        shrink={0}
        items="center"
        justify="center"
        overflow="hidden"
      >
        <InventoryArtwork
          fallbackSize={size === 'small' ? 26 : 34}
          height={artworkSize}
          icon={entry.item.icon}
          itemId={entry.itemId}
          label={entry.item.name}
          testIdPrefix="inventory-item-image"
          width={artworkSize}
        />
      </XStack>
      {imageOnly ? null : (
        <YStack
          testID={`inventory-item-info-${entry.itemId}`}
          grow={1}
          shrink={1}
          minW={0}
          pl={size === 'small' ? '$2' : '$0'}
          pr={size === 'small' ? '$2.5' : '$0'}
          py={size === 'small' ? '$1.5' : '$0'}
          items="flex-end"
          justify="center"
          gap="$1"
        >
          <TerminalText
            testID={`inventory-item-name-${entry.itemId}`}
            width="100%"
            shrink={1}
            minW={0}
            size={size === 'small' ? '$2.5' : '$3'}
            lineHeight={size === 'small' ? '$3' : '$4'}
            fontWeight="700"
            numberOfLines={2}
            text="right"
          >
            {entry.item.name}
          </TerminalText>
          <MonoText
            testID={`inventory-item-quantity-${entry.itemId}`}
            width="100%"
            shrink={0}
            size={size === 'small' ? '$2' : '$2.5'}
            lineHeight={size === 'small' ? '$2.5' : '$3'}
            color="$appAccent"
            text="right"
          >
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </YStack>
      )}
      {selected ? <SelectionCorners itemId={entry.itemId} /> : null}
    </InventoryCellFrame>
  );
});
