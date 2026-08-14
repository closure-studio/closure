import { FlashList } from '@shopify/flash-list';
import { PackageOpen } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import { XStack, YStack, getTokens } from 'tamagui';

import { MonoText, ResponsiveGridRow, TerminalText } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { ItemTable } from '@/schemas/game-data';
import type { Inventory } from '@/schemas/game-account';
import type { LayoutSize } from '@/schemas/layout-size';
import { useLayoutSize } from '@/providers/layout-size-provider';
import {
  formatInventoryQuantity,
  InventoryCell,
  type InventoryEntry,
  INVENTORY_CELL_ARTWORK_SIZE_TOKEN,
  INVENTORY_CELL_MIN_WIDTH_TOKEN,
} from './inventory-cell';
import { InventoryArtwork } from './inventory-artwork';

const INVENTORY_GRID_GAP_TOKEN = '$2';
const PREVIEW_ARTWORK_SIZE = {
  small: 64,
  large: 94,
} as const;
const PREVIEW_FALLBACK_ICON_SIZE = {
  small: 28,
  large: 34,
} as const;

function getEntryItemKey(entry: InventoryEntry): string {
  return entry.itemId;
}

function getItemDescription(value: string | null | undefined): string | undefined {
  return value ? value.split('\\n').join('\n') : undefined;
}

const InventoryPreview = memo(function InventoryPreview({
  entry,
  size,
}: {
  entry: InventoryEntry;
  size: LayoutSize;
}) {
  const description = getItemDescription(entry.item.description);
  const artworkSize = PREVIEW_ARTWORK_SIZE[size];

  return (
    <XStack
      testID="inventory-preview-details"
      width="100%"
      p="$2.5"
      items="center"
      gap={size === 'small' ? '$2.5' : '$3'}
      bg="$appSurfaceRaisedTranslucent"
      borderBottomWidth={1}
      borderColor="$appRule"
    >
      <YStack
        testID="inventory-preview-artwork"
        width={size === 'small' ? '$7' : '$10'}
        height={size === 'small' ? '$7' : '$10'}
        shrink={0}
        items="center"
        justify="center"
        overflow="hidden"
      >
        <InventoryArtwork
          key={entry.itemId}
          fallbackSize={PREVIEW_FALLBACK_ICON_SIZE[size]}
          height={artworkSize}
          icon={entry.item.icon}
          itemId={entry.itemId}
          label={entry.item.name}
          testIdPrefix="inventory-preview-image"
          width={artworkSize}
        />
      </YStack>
      <YStack grow={1} shrink={1} minW={0} gap="$1.5">
        <XStack items="baseline" gap="$2" minW={0}>
          <TerminalText
            testID="inventory-preview-name"
            grow={1}
            shrink={1}
            minW={0}
            size={size === 'small' ? '$4' : '$5'}
            lineHeight={size === 'small' ? '$5' : '$6'}
            fontWeight="800"
            numberOfLines={1}
          >
            {entry.item.name}
          </TerminalText>
          <MonoText shrink={0} size={size === 'small' ? '$2' : '$2.5'} color="$appAccent">
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </XStack>
        {description ? (
          <MonoText
            testID="inventory-preview-description"
            size={size === 'small' ? '$1' : '$2'}
            lineHeight="$2.5"
            color="$appMuted"
            numberOfLines={2}
          >
            {description}
          </MonoText>
        ) : null}
      </YStack>
    </XStack>
  );
});

export function InventoryView({
  inventory,
  itemTable,
}: {
  inventory: Inventory;
  itemTable: ItemTable;
}) {
  const layoutSize = useLayoutSize();
  const entries = useMemo(
    () => Object.entries(inventory).flatMap(([itemId, quantity]) => {
      const item = itemTable[itemId];
      return item ? [{ item, itemId, quantity }] : [];
    }),
    [inventory, itemTable],
  );
  const [requestedItemId, setRequestedItemId] = useState<string | null>(null);
  const selectedItemId = entries.some((entry) => entry.itemId === requestedItemId)
    ? requestedItemId
    : entries[0]?.itemId;
  const selectedEntry = entries.find((entry) => entry.itemId === selectedItemId);
  const tokens = getTokens();
  const gridGap = tokens.space[INVENTORY_GRID_GAP_TOKEN].val;
  const minimumItemWidth = tokens.size[INVENTORY_CELL_MIN_WIDTH_TOKEN[layoutSize]].val;
  const artworkWidth = tokens.size[INVENTORY_CELL_ARTWORK_SIZE_TOKEN[layoutSize]].val;
  const { rows, listWidth, layout, handleLayout, keyExtractor } = useResponsiveGridRows(
    entries,
    (width) => getResponsiveGridLayout(width, gridGap, minimumItemWidth),
    getEntryItemKey,
  );
  const { columnCount, itemWidth } = layout;
  const imageOnly = listWidth > 0 && listWidth < minimumItemWidth;
  const showCells = listWidth === 0 || listWidth >= artworkWidth;

  const renderItem = useCallback(
    ({ item: row, extraData }: { item: InventoryEntry[]; extraData?: string | null }) => (
      <ResponsiveGridRow
        row={row}
        gap={gridGap}
        getItemKey={getEntryItemKey}
        renderCell={(entry) => (
          <InventoryCell
            entry={entry}
            imageOnly={imageOnly}
            itemWidth={itemWidth}
            onSelect={setRequestedItemId}
            selected={entry.itemId === (extraData ?? null)}
            size={layoutSize}
          />
        )}
      />
    ),
    [gridGap, imageOnly, itemWidth, layoutSize],
  );

  if (!selectedEntry) {
    return (
      <YStack testID="inventory-empty" grow={1} items="center" justify="center" gap="$3">
        <PackageOpen color={getTokens().color.appMuted.val} size={44} strokeWidth={1.25} />
      </YStack>
    );
  }

  return (
    <YStack testID="inventory-grid-container" width="100%" grow={1} minH={0} onLayout={handleLayout}>
      <InventoryPreview entry={selectedEntry} size={layoutSize} />
      {showCells ? (
        <FlashList
          testID={`inventory-grid-columns-${columnCount}`}
          data={rows}
          extraData={selectedItemId}
          keyExtractor={keyExtractor}
          style={{ flex: 1 }}
          renderItem={renderItem}
        />
      ) : null}
    </YStack>
  );
}
