import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { YStack } from 'tamagui';

import {
  useAdjacentGameAccountPrefetch,
  useDashboardRoute,
} from '@/features/dashboard';
import type { GameAccount } from '@/schemas/game-account';
import { dashboardPageHref } from './navigation-config';
import type { DashboardPageId } from './navigation-config';

type DashboardAccountPagerRoute = {
  gameAccount: GameAccount;
  key: string;
};

type DashboardAccountPagerProps = {
  pageId: DashboardPageId;
  renderAccount: (gameAccount: GameAccount) => ReactNode;
};

export function DashboardAccountPager({
  pageId,
  renderAccount,
}: DashboardAccountPagerProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { gameAccountId, gameAccounts } = useDashboardRoute();
  const routes = useMemo<DashboardAccountPagerRoute[]>(
    () => gameAccounts.map((gameAccount) => ({
      gameAccount,
      key: gameAccount.account,
    })),
    [gameAccounts],
  );
  const activeIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === gameAccountId),
  );

  useAdjacentGameAccountPrefetch(gameAccounts, gameAccountId);

  const handleIndexChange = useCallback((index: number) => {
    const nextRoute = routes[index];
    if (!nextRoute || nextRoute.key === gameAccountId) return;
    router.replace(dashboardPageHref(pageId, nextRoute.key));
  }, [gameAccountId, pageId, router, routes]);

  const renderScene = useCallback(({
    route,
  }: {
    route: DashboardAccountPagerRoute;
  }) => (
    <YStack grow={1} shrink={1} minW={0} minH={0}>
      {renderAccount(route.gameAccount)}
    </YStack>
  ), [renderAccount]);

  if (routes.length === 0) return null;

  return (
    <TabView
      initialLayout={{ width }}
      lazy
      lazyPreloadDistance={1}
      navigationState={{ index: activeIndex, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      renderTabBar={() => null}
      swipeEnabled={routes.length > 1}
      style={{ flex: 1 }}
    />
  );
}
