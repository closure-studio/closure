import {
  DashboardInventoryContent,
} from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardInventoryRoute() {
  return (
    <DashboardAccountPager
      pageId="inventory"
      renderAccount={(gameAccount) => (
        <DashboardInventoryContent gameAccount={gameAccount} />
      )}
    />
  );
}
