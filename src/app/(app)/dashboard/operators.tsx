import { DashboardOperatorsContent } from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardOperatorsRoute() {
  return (
    <DashboardAccountPager
      renderAccount={(gameAccount) => (
        <DashboardOperatorsContent gameAccount={gameAccount} />
      )}
    />
  );
}
