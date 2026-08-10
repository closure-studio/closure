import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardTasksRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="tasks"
      onBackdropTintChange={setBackdropTint}
    />
  );
}
