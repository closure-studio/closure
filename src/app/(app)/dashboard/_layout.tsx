import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useIsFocused, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { getTokens } from 'tamagui';

import { resolveAdjacentHorizontalSwipeItem } from '@/components';
import type { HorizontalSwipeDirection } from '@/components';
import {
  DashboardShell,
  selectBackdropTint,
} from '@/features/dashboard';
import { DashboardSmallScreenTabBar, dashboardNavigation } from '@/features/navigation';
import type { LinkGameAccountCredentials } from '@/schemas/game-account';
import { getTabScreenOptions, useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { selectActiveGameAccount, useAppStore } from '@/store';

function DashboardLayoutContent({ reducedMotion }: { reducedMotion: boolean }) {
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const isFocused = useIsFocused();
  const router = useRouter();
  const { setBackdropTint } = useSessionBackdrop();
  const activeGameAccount = useAppStore(selectActiveGameAccount);
  const activeGameAccountId = activeGameAccount.id;
  const gameAccounts = useAppStore((state) => state.games.gameAccounts);
  const linkGameAccount = useAppStore((state) => state.linkGameAccount);
  const selectGameAccount = useAppStore((state) => state.selectGameAccount);
  const [isLinkGameAccountSheetOpen, setIsLinkGameAccountSheetOpen] = useState(false);
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
      isContentSwipeEnabled={isFocused && layoutSize === 'small' && gameAccounts.length > 1}
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
        tabBar={layoutSize === 'small'
          ? (props) => <DashboardSmallScreenTabBar {...props} reducedMotion={reducedMotion} />
          : () => null}
      >
        <DashboardTabs.Screen name="index" options={{ href: null }} />
      </DashboardTabs>
    </DashboardShell>
  );
}

export default function DashboardLayout() {
  const reducedMotion = useReducedMotion();

  return <DashboardLayoutContent reducedMotion={reducedMotion} />;
}
