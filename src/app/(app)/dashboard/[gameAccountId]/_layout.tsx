import { Redirect, useIsFocused, usePathname, useRouter } from 'expo-router';
import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useCallback, useEffect, useMemo } from 'react';
import { useReducedMotion } from 'react-native-reanimated';
import { getTokens } from 'tamagui';

import {
  DashboardShell,
  selectBackdropTint,
  useAdjacentGameAccountPrefetch,
  useDashboardRoute,
} from '@/features/dashboard';
import {
  DashboardSmallScreenTabBar,
  dashboardNavigation,
  dashboardPageHref,
  getDashboardPageId,
} from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { ROUTES } from '@/constants/routes';
import { resolveAdjacentHorizontalSwipeItem } from '@/utils/horizontal-swipe';
import type { HorizontalSwipeDirection } from '@/utils/horizontal-swipe';

export default function DashboardAccountLayout() {
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const isFocused = useIsFocused();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const { setBackdropTint } = useSessionBackdrop();
  const { gameAccountId, gameAccount, gameAccounts } = useDashboardRoute();
  const activePageId = getDashboardPageId(pathname) ?? dashboardNavigation.defaultPage.id;
  const backdropTint = selectBackdropTint(gameAccount, {
    primary: colors.appAccent.val,
    warning: colors.appWarning.val,
    muted: colors.appMuted.val,
  });

  useAdjacentGameAccountPrefetch(gameAccounts, gameAccountId);

  useEffect(() => {
    setBackdropTint(backdropTint);
  }, [backdropTint, setBackdropTint]);

  const navigateToAccount = useCallback((nextGameAccountId: string) => {
    router.replace(dashboardPageHref(activePageId, nextGameAccountId));
  }, [activePageId, router]);

  const handleGameAccountSwipe = useCallback((direction: HorizontalSwipeDirection) => {
    if (!gameAccountId) return;
    const adjacentGameAccount = resolveAdjacentHorizontalSwipeItem({
      activeId: gameAccountId,
      direction,
      items: gameAccounts.map((account) => ({ id: account.account })),
    });
    if (adjacentGameAccount) navigateToAccount(adjacentGameAccount.id);
  }, [gameAccountId, gameAccounts, navigateToAccount]);

  const screens = useMemo(
    () => Object.values(dashboardNavigation.pages).map((page) => page.id),
    [],
  );

  if (!gameAccountId || !gameAccount) return <Redirect href={ROUTES.dashboard} />;

  return (
    <DashboardShell
      selectedGameAccountId={gameAccountId}
      gameAccounts={gameAccounts}
      isContentSwipeEnabled={isFocused && layoutSize === 'small' && gameAccounts.length > 1}
      onContentSwipe={handleGameAccountSwipe}
      onSelectGameAccount={navigateToAccount}
    >
      <DashboardTabs
        screenOptions={{
          animation: reducedMotion ? 'none' : 'shift',
          freezeOnBlur: true,
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
        tabBar={layoutSize === 'small' ? (props) => <DashboardSmallScreenTabBar {...props} /> : () => null}
      >
        {screens.map((screen) => (
          <DashboardTabs.Screen key={screen} name={screen} />
        ))}
      </DashboardTabs>
    </DashboardShell>
  );
}
