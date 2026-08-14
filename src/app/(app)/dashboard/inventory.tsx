import {
  DashboardPageFrame,
  InventoryView,
  useSelectedGameDetail,
  useItemTable,
} from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const detail = useSelectedGameDetail();
  const itemTable = useItemTable();

  return (
    <DashboardPageFrame>
      <InventoryView inventory={detail?.inventory ?? {}} itemTable={itemTable} />
    </DashboardPageFrame>
  );
}
