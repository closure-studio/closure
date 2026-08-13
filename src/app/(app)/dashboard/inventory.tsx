import {
  DashboardPageScroll,
  InventoryView,
} from '@/features/dashboard';
import { selectActiveGameDetail, selectItemTable, useAppStore } from '@/store';

export default function DashboardInventoryRoute() {
  const detail = useAppStore(selectActiveGameDetail);
  const itemTable = useAppStore(selectItemTable);

  return (
    <DashboardPageScroll>
      <InventoryView inventory={detail?.inventory ?? {}} itemTable={itemTable} />
    </DashboardPageScroll>
  );
}
