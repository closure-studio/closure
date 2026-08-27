import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';
import { YStack } from 'tamagui';

import {
  useAdjacentGameAccountPrefetch,
  useDashboardAccount,
} from '@/features/dashboard';
import type { GameAccount } from '@/schemas/game-account';

const EMPTY_GAME_ACCOUNTS: readonly GameAccount[] = [];

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
  const { width } = useWindowDimensions();
  const {
    gameAccountsQuery,
    selectedGameAccount,
    selectGameAccount,
  } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? EMPTY_GAME_ACCOUNTS;
  const selectedGameAccountId = selectedGameAccount?.account ?? null;
  const routes = useMemo<DashboardAccountPagerRoute[]>(
    () => gameAccounts.map((gameAccount) => ({
      gameAccount,
      key: gameAccount.account,
    })),
    [gameAccounts],
  );
  const index = Math.max(
    0,
    routes.findIndex((route) => route.key === selectedGameAccountId),
  );
  useAdjacentGameAccountPrefetch(gameAccounts, selectedGameAccountId);

  const handleIndexChange = useCallback((nextIndex: number) => {
    const nextRoute = routes[nextIndex];
    if (!nextRoute) return;

    selectGameAccount(nextRoute.key);
  }, [routes, selectGameAccount]);

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
