import { AnimatePresence, XStack, YStack } from 'tamagui';

import { TerminalPanel, TerminalText } from '@/components';
import type { ItemTable, ItemTableItem } from '@/schemas/game-data';
import type { Inventory } from '@/schemas/game-account';

function InventoryCard({
  item,
  itemId,
  quantity,
}: {
  item: ItemTableItem;
  itemId: string;
  quantity: number;
}) {
  return (
    <TerminalPanel
      testID={`inventory-item-${itemId}`}
      transition="quickLessBouncy"
      enterStyle={{ opacity: 0, y: 12 }}
      exitStyle={{ opacity: 0, scale: 0.9 }}
      opacity={1}
      y={0}
      scale={1}
      width="48.7%"
      minW={140}
      grow={1}
      p={12}
      borderColor="$appBorder"
      $md={{ width: '31.5%' }}
      $lg={{ width: '23.5%' }}
      $xl={{ width: '18.5%' }}
    >
      <TerminalText size="$3" fontWeight="700">{item.name}</TerminalText>
      <TerminalText mt={8} size="$5.5" fontWeight="800" color="$appText">{quantity}</TerminalText>
    </TerminalPanel>
  );
}

export function InventoryView({
  inventory,
  itemTable,
}: {
  inventory: Inventory;
  itemTable: ItemTable;
}) {
  return (
    <YStack gap={16} pb="$4">
      <XStack flexWrap="wrap" gap={8}>
        <AnimatePresence>
          {Object.entries(inventory).map(([itemId, quantity]) => {
            const item = itemTable[itemId];
            return item ? <InventoryCard key={itemId} item={item} itemId={itemId} quantity={quantity} /> : null;
          })}
        </AnimatePresence>
      </XStack>
    </YStack>
  );
}
