import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { Spinner, useMedia, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

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

function DashboardState({ label, loading = false }: { label: string; loading?: boolean }) {
  return (
    <YStack grow={1} items="center" justify="center" gap="$3">
      {loading ? <Spinner color="$appAccent" /> : null}
      <MonoText size="$2">{label}</MonoText>
    </YStack>
  );
}

function DashboardContent() {
  const { t } = useTranslation('dashboard');
  const { large } = useMedia();
  const { gameAccountsQuery } = useDashboardAccount();
  const gameAccounts = gameAccountsQuery.data ?? [];

  if (gameAccountsQuery.isPending || gameAccountsQuery.isError || gameAccounts.length === 0) {
    return <DashboardFrame><DashboardState loading={gameAccountsQuery.isPending} label={t(gameAccountsQuery.isPending ? 'connection.loading' : gameAccountsQuery.isError ? 'connection.error' : 'connection.empty')} /></DashboardFrame>;
  }

  return (
    <DashboardFrame>
      <DashboardTabs
        screenOptions={{
          animation: 'shift',
          headerShown: false,
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
