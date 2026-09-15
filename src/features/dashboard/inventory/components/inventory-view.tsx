import { FlashList } from '@shopify/flash-list';
import { PackageOpen } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Dialog, XStack, YStack, getTokens, useMedia } from 'tamagui';

import { AdaptiveDialog, ItemArtwork, MonoText, ResponsiveGridRow, TerminalText } from '@/components';
import { getResponsiveGridLayout, useResponsiveGridRows } from '@/hooks/use-responsive-grid-rows';
import type { ItemTable } from '@/schemas/game-data';
import type { Inventory } from '@/schemas/game-account';
import { getItemImageUrl } from '@/utils/item-image';
import {
  formatInventoryQuantity,
  InventoryCell,
  type InventoryEntry,
  INVENTORY_CELL_LARGE_MIN_WIDTH,
  INVENTORY_CELL_MIN_WIDTH,
} from './inventory-cell';

const INVENTORY_GRID_GAP_TOKEN = '$2';

export const EMPTY_INVENTORY: Inventory = {};

function getEntryItemKey(entry: InventoryEntry): string {
  return entry.itemId;
}

function getItemDescription(value: string | null | undefined): string | undefined {
  return value ? value.split('\\n').join('\n') : undefined;
}

function InventoryDetails({ entry }: { entry: InventoryEntry }) {
  const description = getItemDescription(entry.item.description);
  const quantity = (
    <MonoText
      testID="inventory-detail-quantity"
      shrink={0}
      size="$2"
      color="$appAccent"
      $large={{ size: '$2.5' }}
    >
      {formatInventoryQuantity(entry.quantity)}
    </MonoText>
  );

  return (
    <XStack
      testID="inventory-details"
      width="100%"
      items="center"
      gap="$2.5"
      $large={{ gap: '$3' }}
    >
      <ItemArtwork
        accessibilityLabel={entry.item.name}
        recyclingKey={entry.itemId}
        source={getItemImageUrl(entry.item.icon)}
        testID={`inventory-detail-image-${entry.itemId}`}
      />
      <YStack grow={1} shrink={1} minW={0} gap="$1.5">
        <XStack items="baseline" gap="$2" minW={0}>
          <Dialog.Title asChild>
            <TerminalText
              testID="inventory-detail-name"
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
          </Dialog.Title>
          {description ? quantity : <Dialog.Description asChild>{quantity}</Dialog.Description>}
        </XStack>
        {description ? (
          <Dialog.Description asChild>
            <MonoText
              testID="inventory-detail-description"
              size="$1"
              lineHeight="$2.5"
              color="$appMuted"
              $large={{ size: '$2' }}
            >
              {description}
            </MonoText>
          </Dialog.Description>
        ) : null}
      </YStack>
    </XStack>
  );
}

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
  const [detailsOpen, setDetailsOpen] = useState(false);
  const handleSelectItem = useCallback((itemId: string) => {
    setSelection({ accountId, itemId });
    setDetailsOpen(true);
  }, [accountId]);
  const tokens = getTokens();
  const gridGap = tokens.space[INVENTORY_GRID_GAP_TOKEN].val;
  const minimumItemWidth = large ? INVENTORY_CELL_LARGE_MIN_WIDTH : INVENTORY_CELL_MIN_WIDTH;
  const { rows, layout, handleLayout, keyExtractor } = useResponsiveGridRows(
    entries,
    (width) => getResponsiveGridLayout(width, gridGap, minimumItemWidth),
    getEntryItemKey,
  );
  const { columnCount, itemWidth } = layout;

  const renderItem = useCallback(
    ({ item: row, index: rowIndex, extraData }: { item: InventoryEntry[]; index: number; extraData?: string | null }) => (
      <ResponsiveGridRow
        isLast={rowIndex === rows.length - 1}
        row={row}
        gap={gridGap}
        getItemKey={getEntryItemKey}
        renderCell={(entry) => (
          <InventoryCell
            entry={entry}
            itemWidth={itemWidth}
            onSelect={handleSelectItem}
            selected={entry.itemId === (extraData ?? null)}
          />
        )}
      />
    ),
    [gridGap, handleSelectItem, itemWidth, rows.length],
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
      <FlashList
        testID={`inventory-grid-columns-${columnCount}`}
        data={rows}
        extraData={selectedItemId}
        keyExtractor={keyExtractor}
        style={{ flex: 1 }}
        renderItem={renderItem}
      />
      <AdaptiveDialog
        open={detailsOpen && selection.accountId === accountId}
        onOpenChange={setDetailsOpen}
        testIDPrefix="inventory-detail"
      >
        <InventoryDetails entry={selectedEntry} />
      </AdaptiveDialog>
    </YStack>
  );
}
