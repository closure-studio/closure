import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardOverviewRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="overview"
      onBackdropTintChange={setBackdropTint}
    />
  );
}
