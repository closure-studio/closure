import { useRouter } from 'expo-router';

import { DashboardScreen } from '@/features/dashboard';
import { dashboardNavigation } from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardActivityRoute() {
  const router = useRouter();
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="activity"
      onBackdropTintChange={setBackdropTint}
      onShowOverview={() => router.replace(dashboardNavigation.defaultPage.route)}
    />
  );
}
