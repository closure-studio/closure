import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useEffect } from 'react';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardAccountProvider,
  useDashboardAccount,
} from '@/features/dashboard';
import {
  DashboardFrame,
  DashboardSmallScreenTabBar,
  dashboardPagesList,
} from '@/features/navigation';
import { useLayoutSize } from '@/providers/layout-size-provider';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

function DashboardContent() {
  const layoutSize = useLayoutSize();
  const {
    gameAccountsQuery,
    selectedGameAccount,
    selectGameAccount,
  } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];
  const fallbackGameAccountId = gameAccounts[0]?.account;

  useEffect(() => {
    if (!selectedGameAccount && fallbackGameAccountId) {
      selectGameAccount(fallbackGameAccountId);
    }
  }, [fallbackGameAccountId, selectedGameAccount, selectGameAccount]);

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  if (!selectedGameAccount) return null;

  return (
    <DashboardFrame>
      <DashboardTabs
        screenOptions={{
          animation: 'shift',
          freezeOnBlur: true,
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
        tabBar={layoutSize === 'small'
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
    </DashboardFrame>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardAccountProvider>
      <DashboardContent />
    </DashboardAccountProvider>
  );
}
