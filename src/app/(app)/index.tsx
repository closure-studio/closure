import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      onBackdropTintChange={setBackdropTint}
    />
  );
}
