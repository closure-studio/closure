import {
  DashboardPageScroll,
  InventoryView,
  useSelectedGameDetail,
  useItemTable,
} from '@/features/dashboard';

export default function DashboardInventoryRoute() {
  const detail = useSelectedGameDetail();
  const itemTable = useItemTable();

  return (
    <DashboardPageScroll>
      <InventoryView inventory={detail?.inventory ?? {}} itemTable={itemTable} />
    </DashboardPageScroll>
  );
}