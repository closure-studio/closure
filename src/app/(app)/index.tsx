import { useRouter } from 'expo-router';

import { DashboardScreen } from '@/features/dashboard';
import { useAuth, useSessionBackdrop } from '@/features/session';

export default function DashboardRoute() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { resetBackdropTint, setBackdropTint } = useSessionBackdrop();

  const handleLogout = () => {
    resetBackdropTint();
    router.replace('/login');
    signOut();
  };

  return (
    <DashboardScreen
      onBackdropTintChange={setBackdropTint}
      onLogout={handleLogout}
      onOpenSettings={() => router.push('/settings')}
    />
  );
}
