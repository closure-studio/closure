import { FlashList } from '@shopify/flash-list';
import { PackageOpen } from 'lucide-react-native';
import { memo, useCallback, useMemo, useState } from 'react';
import { XStack, YStack, getTokens, useMedia } from 'tamagui';

import { ITEM_ARTWORK_LARGE_SIZE, ITEM_ARTWORK_SIZE } from '@/components/ui/item-artwork';
import { MonoText, ResponsiveGridRow, TerminalText } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { ItemTable } from '@/schemas/game-data';
import type { Inventory } from '@/schemas/game-account';
import { InventoryPreviewArtwork } from './inventory-artwork';
import {
  formatInventoryQuantity,
  InventoryCell,
  type InventoryEntry,
  INVENTORY_CELL_LARGE_MIN_WIDTH,
  INVENTORY_CELL_MIN_WIDTH,
} from './inventory-cell';

const INVENTORY_GRID_GAP_TOKEN = '$2';
const PREVIEW_ARTWORK_SIZE = 64;
const PREVIEW_ARTWORK_LARGE_SIZE = 94;
const PREVIEW_FALLBACK_ICON_SIZE = 28;
const PREVIEW_FALLBACK_ICON_LARGE_SIZE = 34;

export const EMPTY_INVENTORY: Inventory = {};

function getEntryItemKey(entry: InventoryEntry): string {
  return entry.itemId;
}

function getItemDescription(value: string | null | undefined): string | undefined {
  return value ? value.split('\\n').join('\n') : undefined;
}

const InventoryPreview = memo(function InventoryPreview({
  entry,
}: {
  entry: InventoryEntry;
}) {
  const { large } = useMedia();
  const description = getItemDescription(entry.item.description);
  const artworkSize = large ? PREVIEW_ARTWORK_LARGE_SIZE : PREVIEW_ARTWORK_SIZE;

  return (
    <XStack
      testID="inventory-preview-details"
      width="100%"
      p="$2.5"
      items="center"
      gap="$2.5"
      bg="$appSurfaceRaisedTranslucent"
      borderBottomWidth={1}
      borderColor="$appRule"
      $large={{ gap: '$3' }}
    >
      <YStack
        testID="inventory-preview-artwork"
        width="$7"
        height="$7"
        shrink={0}
        items="center"
        justify="center"
        overflow="hidden"
        $large={{ width: '$10', height: '$10' }}
      >
        <InventoryPreviewArtwork
          key={entry.itemId}
          fallbackSize={large ? PREVIEW_FALLBACK_ICON_LARGE_SIZE : PREVIEW_FALLBACK_ICON_SIZE}
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
            size="$4"
            lineHeight="$5"
            fontWeight="800"
            numberOfLines={1}
            $large={{ size: '$5', lineHeight: '$6' }}
          >
            {entry.item.name}
          </TerminalText>
          <MonoText shrink={0} size="$2" color="$appAccent" $large={{ size: '$2.5' }}>
            {formatInventoryQuantity(entry.quantity)}
          </MonoText>
        </XStack>
        {description ? (
          <MonoText
            testID="inventory-preview-description"
            size="$1"
            lineHeight="$2.5"
            color="$appMuted"
            numberOfLines={2}
            $large={{ size: '$2' }}
          >
            {description}
          </MonoText>
        ) : null}
      </YStack>
    </XStack>
  );
});

const InventoryRow = memo(function InventoryRow({
  isLast,
  row,
  gap,
  imageOnly,
  itemWidth,
  selectedItemId,
  onSelect,
}: {
  isLast: boolean;
  row: InventoryEntry[];
  gap: number;
  imageOnly: boolean;
  itemWidth: number | undefined;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
}) {
  return (
    <ResponsiveGridRow
      isLast={isLast}
      row={row}
      gap={gap}
      getItemKey={getEntryItemKey}
      renderCell={(entry) => (
        <InventoryCell
          entry={entry}
          imageOnly={imageOnly}
          itemWidth={itemWidth}
          onSelect={onSelect}
          selected={entry.itemId === selectedItemId}
        />
      )}
    />
  );
});

export function InventoryView({
  accountId,
  inventory,
  itemTable,
}: {
  accountId: string | null;
  inventory: Inventory;
  itemTable: ItemTable;
}) {
  const { large } = useMedia();
  const { entries, byId } = useMemo(() => {
    const builtEntries: InventoryEntry[] = [];
    const builtById = new Map<string, InventoryEntry>();

    for (const [itemId, quantity] of Object.entries(inventory)) {
      const item = itemTable[itemId];
      if (!item) continue;
      const entry = { item, itemId, quantity };
      builtEntries.push(entry);
      builtById.set(itemId, entry);
    }

    return { entries: builtEntries, byId: builtById };
  }, [inventory, itemTable]);
  const [selection, setSelection] = useState<{
    accountId: string | null;
    itemId: string | null;
  }>({ accountId, itemId: null });

  // Selection is stored together with the account it was made on, so an
  // account boundary instantly invalidates it without a state effect or a
  // list remount; the fallback below selects the new account's first entry.
  const selectedEntry = (
    selection.accountId === accountId && selection.itemId !== null
      ? byId.get(selection.itemId)
      : undefined
  ) ?? entries[0];
  const selectedItemId = selectedEntry?.itemId ?? null;
  const handleSelectItem = useCallback((itemId: string) => {
    setSelection({ accountId, itemId });
  }, [accountId]);
  const tokens = getTokens();
  const gridGap = tokens.space[INVENTORY_GRID_GAP_TOKEN].val;
  const minimumItemWidth = large ? INVENTORY_CELL_LARGE_MIN_WIDTH : INVENTORY_CELL_MIN_WIDTH;
  const artworkWidth = large ? ITEM_ARTWORK_LARGE_SIZE : ITEM_ARTWORK_SIZE;
  const { rows, listWidth, layout, handleLayout, keyExtractor } = useResponsiveGridRows(
    entries,
    (width) => getResponsiveGridLayout(width, gridGap, minimumItemWidth),
    getEntryItemKey,
  );
  const { columnCount, itemWidth } = layout;
  const imageOnly = listWidth > 0 && listWidth < minimumItemWidth;
  const showCells = listWidth === 0 || listWidth >= artworkWidth;

  const renderItem = useCallback(
    ({ item: row, index: rowIndex, extraData }: { item: InventoryEntry[]; index: number; extraData?: string | null }) => (
      <InventoryRow
        isLast={rowIndex === rows.length - 1}
        row={row}
        gap={gridGap}
        imageOnly={imageOnly}
        itemWidth={itemWidth}
        selectedItemId={extraData ?? null}
        onSelect={handleSelectItem}
      />
    ),
    [gridGap, handleSelectItem, imageOnly, itemWidth, rows.length],
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
      <InventoryPreview entry={selectedEntry} />
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
