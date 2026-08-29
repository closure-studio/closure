import { GameHostingConfigScreen } from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardSettingsRoute() {
  return (
    <DashboardAccountPager
      renderAccount={(gameAccount) => (
        <GameHostingConfigScreen gameAccount={gameAccount} />
      )}
    />
  );
}
