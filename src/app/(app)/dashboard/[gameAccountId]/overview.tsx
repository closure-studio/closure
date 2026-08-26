import {
  DashboardOverviewContent,
} from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardOverviewRoute() {
  return (
    <DashboardAccountPager
      pageId="overview"
      renderAccount={(gameAccount) => (
        <DashboardOverviewContent gameAccount={gameAccount} />
      )}
    />
  );
}
