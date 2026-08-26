import {
  DashboardPageFrame,
  EMPTY_INVENTORY,
  InventoryView,
  useDashboardRoute,
  useGameDetailQuery,
  useItemTable,
} from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const { gameAccountId } = useDashboardRoute();
  const detail = useGameDetailQuery(gameAccountId).data;
  const itemTable = useItemTable();

  return (
    <DashboardPageFrame flushBottom>
      <InventoryView
        accountId={gameAccountId}
        inventory={detail?.inventory ?? EMPTY_INVENTORY}
        itemTable={itemTable}
      />
    </DashboardPageFrame>
  );
}
