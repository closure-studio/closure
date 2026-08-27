import { useRouter } from 'expo-router';
import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useEffect } from 'react';
import { Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardRouteProvider,
  useDashboardRoute,
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
  const router = useRouter();
  const {
    gameAccount,
    gameAccountId,
    gameAccounts,
    gameAccountsQuery,
  } = useDashboardRoute();
  const fallbackGameAccountId = gameAccounts[0]?.account;

  useEffect(() => {
    if ((!gameAccountId || !gameAccount) && fallbackGameAccountId) {
      router.setParams({ gameAccountId: fallbackGameAccountId });
    }
  }, [fallbackGameAccountId, gameAccount, gameAccountId, router]);

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  if (!gameAccountId || !gameAccount) return null;

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
              gameAccountId={gameAccountId}
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
    <DashboardRouteProvider>
      <DashboardContent />
    </DashboardRouteProvider>
  );
}
