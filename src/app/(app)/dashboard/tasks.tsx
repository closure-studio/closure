import { useRouter } from 'expo-router';

import { DashboardScreen } from '@/features/dashboard';
import { dashboardNavigation } from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardTasksRoute() {
  const router = useRouter();
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="tasks"
      onBackdropTintChange={setBackdropTint}
      onShowOverview={() => router.replace(dashboardNavigation.defaultPage.route)}
    />
  );
}
