import { memo } from 'react';
import { XStack, YStack, styled } from 'tamagui';

import { ItemArtwork, MonoText, TerminalText } from '@/components';
import type { ItemTableItem } from '@/schemas/game-data';
import { getItemImageUrl } from '@/utils/item-image';

export const INVENTORY_CELL_MIN_WIDTH = 124;
export const INVENTORY_CELL_LARGE_MIN_WIDTH = 224;

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
  gap: '$0',
  px: '$0',
  py: '$0',
  $large: {
    gap: '$3',
    px: '$3',
    py: '$2',
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
  } as const,
  defaultVariants: {
    imageOnly: false,
    selected: false,
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
}: {
  entry: InventoryEntry;
  imageOnly: boolean;
  itemWidth: number | undefined;
  onSelect: (itemId: string) => void;
  selected: boolean;
}) {
  const artwork = (
    <ItemArtwork
      accessibilityLabel={entry.item.name}
      recyclingKey={entry.itemId}
      source={getItemImageUrl(entry.item.icon)}
      testID={`inventory-item-image-${entry.itemId}`}
    />
  );

  return (
    <InventoryCellFrame
      testID={`inventory-item-${entry.itemId}`}
      role="button"
      aria-label={`${entry.item.name}, ${entry.quantity.toLocaleString()}`}
      aria-selected={selected}
      onPress={() => onSelect(entry.itemId)}
      imageOnly={imageOnly}
      selected={selected}
      width={itemWidth ?? '100%'}
    >
      <YStack ml="$1.5" my="$0.5" $large={{ ml: '$0', my: '$0' }}>
        {artwork}
      </YStack>
      {imageOnly ? null : (
        <YStack
          testID={`inventory-item-info-${entry.itemId}`}
          grow={1}
          shrink={1}
          minW={0}
          pl="$2"
          pr="$2.5"
          py="$1.5"
          items="flex-end"
          justify="center"
          gap="$1"
          $large={{ pl: '$0', pr: '$0', py: '$0' }}
        >
          <TerminalText
            testID={`inventory-item-name-${entry.itemId}`}
            width="100%"
            shrink={1}
            minW={0}
            size="$2.5"
            lineHeight="$3"
            fontWeight="700"
            numberOfLines={2}
            text="right"
            $large={{ size: '$3', lineHeight: '$4' }}
          >
            {entry.item.name}
          </TerminalText>
          <MonoText
            testID={`inventory-item-quantity-${entry.itemId}`}
            width="100%"
            shrink={0}
            size="$2"
            lineHeight="$2.5"
            color="$appAccent"
            text="right"
            $large={{ size: '$2.5', lineHeight: '$3' }}
          >
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </YStack>
      )}
      {selected ? <SelectionCorners itemId={entry.itemId} /> : null}
    </InventoryCellFrame>
  );
});
