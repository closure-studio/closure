import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useRouter } from 'expo-router';
import { Spinner, useMedia, YStack } from 'tamagui';
import { useTranslation } from 'react-i18next';

import { MonoText } from '@/components';
import {
  DashboardAccountProvider,
  EmptyGameAccountState,
  GameAccountCreationDialog,
  useDashboardAccount,
  useDashboardLiveLogToast,
  useGameAccountCreation,
} from '@/features/dashboard';
import {
  DashboardFrame,
  DashboardScope,
  DashboardSmallScreenTabBar,
  dashboardDefaultPageId,
  dashboardPageHref,
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
  const router = useRouter();
  const { gameAccountsQuery } = useDashboardAccount();
  useDashboardLiveLogToast();
  const gameAccounts = gameAccountsQuery.data ?? [];
  const {
    canCreateGame,
    dialog,
    openDialog,
  } = useGameAccountCreation({
    onGameAccountSelected: () => {
      router.replace(dashboardPageHref(dashboardDefaultPageId));
    },
  });

  let content;
  if (gameAccountsQuery.isPending || gameAccountsQuery.isError) {
    content = (
      <DashboardState
        loading={gameAccountsQuery.isPending}
        label={t(gameAccountsQuery.isPending ? 'connection.loading' : 'connection.error')}
      />
    );
  } else if (gameAccounts.length === 0) {
    content = (
      <EmptyGameAccountState onAddGameAccount={openDialog} />
    );
  } else {
    content = (
      <DashboardTabs
        screenOptions={{
          animation: 'shift',
          headerShown: false,
          sceneStyle: { backgroundColor: 'transparent' },
        }}
        tabBar={!large
          ? (props) => (
              <DashboardSmallScreenTabBar
                {...props}
                canCreateGame={canCreateGame}
                onAddGameAccount={openDialog}
              />
            )
          : () => null}
      >
        {dashboardPages.map((page) => (
          <DashboardTabs.Screen key={page.id} name={page.id} />
        ))}
      </DashboardTabs>
    );
  }

  return (
    <>
      <DashboardFrame
        canCreateGame={canCreateGame}
        onAddGameAccount={openDialog}
      >
        {content}
      </DashboardFrame>
      <GameAccountCreationDialog {...dialog} />
    </>
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
