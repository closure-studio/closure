import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { YStack } from 'tamagui';

import {
  useAdjacentGameAccountPrefetch,
  useDashboardRoute,
} from '@/features/dashboard';
import type { GameAccount } from '@/schemas/game-account';

type DashboardAccountPagerRoute = {
  gameAccount: GameAccount;
  key: string;
};

type DashboardAccountPagerProps = {
  renderAccount: (gameAccount: GameAccount) => ReactNode;
};

export function DashboardAccountPager({
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
  const routeIndex = Math.max(
    0,
    routes.findIndex((route) => route.key === gameAccountId),
  );
  const [index, setIndex] = useState(routeIndex);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- synchronize after an external URL change
    setIndex(routeIndex);
  }, [routeIndex]);

  useAdjacentGameAccountPrefetch(gameAccounts, gameAccountId);

  const handleIndexChange = useCallback((nextIndex: number) => {
    const nextRoute = routes[nextIndex];
    if (!nextRoute) return;

    setIndex(nextIndex);
    if (nextRoute.key === gameAccountId) return;
    router.setParams({ gameAccountId: nextRoute.key });
  }, [gameAccountId, router, routes]);

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
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      renderTabBar={() => null}
      swipeEnabled={routes.length > 1}
      style={{ flex: 1 }}
    />
  );
}
