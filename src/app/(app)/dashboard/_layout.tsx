import { Stack as DashboardStack } from 'expo-router/js-stack';
import { useRouter } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';

import { DashboardProvider, DashboardShell, useDashboardState } from '@/features/dashboard';
import { dashboardNavigation } from '@/features/navigation';
import type { LinkGameAccountCredentials } from '@/schemas/game-account';
import { getRouteScreenOptions } from '@/features/session';

function DashboardLayoutContent({ reducedMotion }: { reducedMotion: boolean }) {
  const router = useRouter();
  const {
    activeGameAccountId,
    gameAccounts,
    isLinkGameAccountSheetOpen,
    linkGameAccount,
    selectGameAccount,
    setIsLinkGameAccountSheetOpen,
  } = useDashboardState();

  const handleLinkGameAccount = (credentials: LinkGameAccountCredentials) => {
    linkGameAccount(credentials);
    router.replace(dashboardNavigation.defaultPage.route);
  };

  return (
    <DashboardShell
      activeGameAccountId={activeGameAccountId}
      gameAccounts={gameAccounts}
      isLinkGameAccountSheetOpen={isLinkGameAccountSheetOpen}
      onLinkGameAccount={handleLinkGameAccount}
      onLinkGameAccountSheetOpenChange={setIsLinkGameAccountSheetOpen}
      onOpenLinkGameAccount={() => setIsLinkGameAccountSheetOpen(true)}
      onSelectGameAccount={selectGameAccount}
    >
      <DashboardStack screenOptions={getRouteScreenOptions(reducedMotion)} />
    </DashboardShell>
  );
}

export default function DashboardLayout() {
  const reducedMotion = useReducedMotion();

  return (
    <DashboardProvider>
      <DashboardLayoutContent reducedMotion={reducedMotion} />
    </DashboardProvider>
  );
}
