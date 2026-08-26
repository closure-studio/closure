import { GameHostingConfigScreen } from '@/features/dashboard';
import { DashboardAccountPager } from '@/features/navigation';

export default function DashboardSettingsRoute() {
  return (
    <DashboardAccountPager
      pageId="settings"
      renderAccount={(gameAccount) => (
        <GameHostingConfigScreen gameAccount={gameAccount} />
      )}
    />
  );
}
