import {
  DashboardPageScroll,
  InventoryView,
  useActiveGameDetail,
  useItemTable,
} from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const detail = useActiveGameDetail();
  const itemTable = useItemTable();

  return (
    <DashboardPageScroll>
      <InventoryView inventory={detail?.inventory ?? {}} itemTable={itemTable} />
    </DashboardPageScroll>
  );
}