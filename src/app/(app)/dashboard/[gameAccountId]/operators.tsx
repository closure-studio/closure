import {
  DashboardOperatorsContent,
} from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardOperatorsRoute() {
  return (
    <DashboardAccountPager
      pageId="operators"
      renderAccount={(gameAccount) => (
        <DashboardOperatorsContent gameAccount={gameAccount} />
      )}
    />
  );
}
