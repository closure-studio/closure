import { DashboardOverviewContent } from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardOverviewRoute() {
  return (
    <DashboardAccountPager
      renderAccount={(gameAccount) => (
        <DashboardOverviewContent gameAccount={gameAccount} />
      )}
    />
  );
}
