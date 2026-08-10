import { DashboardScreen } from '@/features/dashboard';
import { useSessionBackdrop } from '@/features/session';

export default function DashboardInventoryRoute() {
  const { setBackdropTint } = useSessionBackdrop();

  return (
    <DashboardScreen
      activePageId="inventory"
      onBackdropTintChange={setBackdropTint}
    />
  );
}
