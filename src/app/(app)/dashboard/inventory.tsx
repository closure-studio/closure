import { InventoryView, itemTable, useDashboardState } from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const { activeGameAccount } = useDashboardState();

  return <InventoryView inventory={activeGameAccount.inventory} itemTable={itemTable} />;
}
