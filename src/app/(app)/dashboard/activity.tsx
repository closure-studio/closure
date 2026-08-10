import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardActivityRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="activity"
      onBackdropTintChange={setBackdropTint}
    />
  );
}
