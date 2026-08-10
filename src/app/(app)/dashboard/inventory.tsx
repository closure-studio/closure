import {
  DashboardPageScroll,
  InventoryView,
  itemTable,
  useDashboardState,
} from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const { activeGameAccount } = useDashboardState();

  return (
    <DashboardPageScroll>
      <InventoryView inventory={activeGameAccount.inventory} itemTable={itemTable} />
    </DashboardPageScroll>
  );
}
