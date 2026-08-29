import { DashboardInventoryContent } from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardInventoryRoute() {
  return (
    <DashboardAccountPager
      renderAccount={(gameAccount) => (
        <DashboardInventoryContent gameAccount={gameAccount} />
      )}
    />
  );
}
