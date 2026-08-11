import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { getTokens, useMedia } from 'tamagui';

import { resolveAdjacentHorizontalSwipeItem } from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import {
  DashboardProvider,
  DashboardShell,
  selectBackdropTint,
  useDashboardState,
} from '@/features/dashboard';
import { DashboardMobileTabBar, dashboardNavigation } from '@/features/navigation';
import type { LinkGameAccountCredentials } from '@/schemas/game-account';
import { getTabScreenOptions, useSessionBackdrop } from '@/features/session';

function DashboardLayoutContent({ reducedMotion }: { reducedMotion: boolean }) {
  const colors = getTokens().color;
  const media = useMedia();
  const isFocused = useIsFocused();
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
  const isCompact = Boolean(media['max-md']);

  useEffect(() => {
    setBackdropTint(backdropTint);
  }, [backdropTint, setBackdropTint]);

  const handleLinkGameAccount = (credentials: LinkGameAccountCredentials) => {
    linkGameAccount(credentials);
    router.replace(dashboardNavigation.defaultPage.route);
  };

  const handleGameAccountSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    const adjacentGameAccount = resolveAdjacentHorizontalSwipeItem({
      activeId: activeGameAccountId,
      direction,
      items: gameAccounts,
    });
    if (adjacentGameAccount) selectGameAccount(adjacentGameAccount.id);
  }, [activeGameAccountId, gameAccounts, selectGameAccount]);

  return (
    <DashboardShell
      activeGameAccountId={activeGameAccountId}
      gameAccounts={gameAccounts}
      isContentSwipeEnabled={isFocused && isCompact && gameAccounts.length > 1}
      isLinkGameAccountSheetOpen={isLinkGameAccountSheetOpen}
      onContentSwipe={handleGameAccountSwipe}
      onLinkGameAccount={handleLinkGameAccount}
      onLinkGameAccountSheetOpenChange={setIsLinkGameAccountSheetOpen}
      onOpenLinkGameAccount={() => setIsLinkGameAccountSheetOpen(true)}
      onSelectGameAccount={selectGameAccount}
    >
      <DashboardTabs
        detachInactiveScreens={process.env.EXPO_OS !== 'ios'}
        screenOptions={getTabScreenOptions(reducedMotion)}
        tabBar={isCompact
          ? (props) => <DashboardMobileTabBar {...props} reducedMotion={reducedMotion} />
          : () => null}
      >
        <DashboardTabs.Screen name="index" options={{ href: null }} />
      </DashboardTabs>
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
