import {
  DashboardPageFrame,
  EMPTY_INVENTORY,
  InventoryView,
  useItemTable,
  useSelectedGameDetailQuery,
} from '@/features/dashboard';
import { useAppStore } from '@/store';

export default function DashboardInventoryRoute() {
  const selectedGameAccountId = useAppStore((state) => state.selectedGameAccountId);
  const detail = useSelectedGameDetailQuery().data;
  const itemTable = useItemTable();

  return (
    <DashboardPageFrame>
      <InventoryView
        accountId={selectedGameAccountId}
        inventory={detail?.inventory ?? EMPTY_INVENTORY}
        itemTable={itemTable}
      />
    </DashboardPageFrame>
  );
}
