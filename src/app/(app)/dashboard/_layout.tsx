import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { getTokens } from 'tamagui';

import {
  DashboardProvider,
  DashboardShell,
  selectBackdropTint,
  useDashboardState,
} from '@/features/dashboard';
import { dashboardNavigation } from '@/features/navigation';
import type { LinkGameAccountCredentials } from '@/schemas/game-account';
import { getTabScreenOptions, useSessionBackdrop } from '@/features/session';

const renderHiddenTabBar = () => null;

function DashboardLayoutContent({ reducedMotion }: { reducedMotion: boolean }) {
  const colors = getTokens().color;
  const router = useRouter();
  const { setBackdropTint } = useSessionBackdrop();
  const {
    activeGameAccount,
    activeGameAccountId,
    gameAccounts,
    isLinkGameAccountSheetOpen,
    linkGameAccount,
    selectGameAccount,
    setIsLinkGameAccountSheetOpen,
  } = useDashboardState();
  const backdropTint = selectBackdropTint(activeGameAccount, {
    primary: colors.appAccent.val,
    warning: colors.appWarning.val,
    muted: colors.appMuted.val,
  });

  useEffect(() => {
    setBackdropTint(backdropTint);
  }, [backdropTint, setBackdropTint]);

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
      <DashboardTabs
        screenOptions={getTabScreenOptions(reducedMotion)}
        tabBar={renderHiddenTabBar}
      />
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
