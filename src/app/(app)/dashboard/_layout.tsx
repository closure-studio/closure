import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { Spinner, useMedia, YStack } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardAccountProvider,
  useDashboardAccount,
} from '@/features/dashboard';
import {
  DashboardFrame,
  DashboardScope,
  DashboardSmallScreenTabBar,
  dashboardPages,
} from '@/features/navigation';

function DashboardState({ label }: { label: string }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      <Spinner color="$appAccent" />
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

function DashboardContent() {
  const { large } = useMedia();
  const { gameAccountsQuery } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  return (
    <DashboardFrame>
      <DashboardTabs
        detachInactiveScreens={false}
        screenOptions={{
          animation: 'shift',
          freezeOnBlur: false,
          headerShown: false,
          lazy: true,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
        tabBar={!large
          ? (props) => <DashboardSmallScreenTabBar {...props} />
          : () => null}
      >
        {dashboardPages.map((page) => (
          <DashboardTabs.Screen key={page.id} name={page.id} />
        ))}
      </DashboardTabs>
    </DashboardFrame>
  );
}

export default function DashboardLayout() {
  return (
    <DashboardAccountProvider>
      <DashboardScope>
        <DashboardContent />
      </DashboardScope>
    </DashboardAccountProvider>
  );
}
