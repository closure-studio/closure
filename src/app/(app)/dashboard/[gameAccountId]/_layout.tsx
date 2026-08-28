import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useEffect } from 'react';
import { useMedia } from 'tamagui';

import { useDashboardAccount } from '@/features/dashboard';
import {
  DashboardSmallScreenTabBar,
  dashboardPagesList,
} from '@/features/navigation';

export default function DashboardAccountLayout() {
  const { large } = useMedia();
  const {
    gameAccountsQuery,
    selectedGameAccount,
    selectGameAccount,
  } = useDashboardAccount();
  const fallbackGameAccountId = gameAccountsQuery.data?.[0]?.account;

  useEffect(() => {
    if (!selectedGameAccount && fallbackGameAccountId) {
      selectGameAccount(fallbackGameAccountId);
    }
  }, [fallbackGameAccountId, selectedGameAccount, selectGameAccount]);

  if (!selectedGameAccount) return null;

  return (
    <DashboardTabs
      screenOptions={{
        animation: 'shift',
        freezeOnBlur: true,
        headerShown: false,
        lazy: true,
        sceneStyle: { backgroundColor: 'transparent' },
      }}
      tabBar={!large
        ? (props) => (
          <DashboardSmallScreenTabBar
            {...props}
            gameAccountId={selectedGameAccount.account}
          />
        )
        : () => null}
    >
      {dashboardPagesList.map((page) => (
        <DashboardTabs.Screen key={page.id} name={page.id} />
      ))}
    </DashboardTabs>
  );
}
