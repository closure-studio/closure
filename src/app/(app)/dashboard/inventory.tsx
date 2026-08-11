import {
  DashboardPageScroll,
  InventoryView,
  itemTable,
} from '@/features/dashboard';
import { selectActiveGameAccount, useAppStore } from '@/store';

export default function DashboardInventoryRoute() {
  const activeGameAccount = useAppStore(selectActiveGameAccount);

  return (
    <DashboardPageScroll>
      <InventoryView inventory={activeGameAccount.inventory} itemTable={itemTable} />
    </DashboardPageScroll>
  );
}
