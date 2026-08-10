import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardOperatorsRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="operators"
      onBackdropTintChange={setBackdropTint}
    />
  );
}
