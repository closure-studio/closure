import { Redirect } from 'expo-router';
import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useEffect, useMemo } from 'react';
import { getTokens, Spinner, YStack } from 'tamagui';

import { MonoText } from '@/components';
import {
  DashboardRouteProvider,
  selectBackdropTint,
  useDashboardRoute,
} from '@/features/dashboard';
import {
  DashboardFrame,
  DashboardSmallScreenTabBar,
  dashboardNavigation,
  dashboardPageHref,
} from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';
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
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const { setBackdropTint } = useSessionBackdrop();
  const {
    gameAccount,
    gameAccountId,
    gameAccounts,
    gameAccountsQuery,
  } = useDashboardRoute();
  const backdropTint = selectBackdropTint(gameAccount, {
    primary: colors.appAccent.val,
    warning: colors.appWarning.val,
    muted: colors.appMuted.val,
  });

  useEffect(() => {
    setBackdropTint(backdropTint);
  }, [backdropTint, setBackdropTint]);

  const screens = useMemo(
    () => Object.values(dashboardNavigation.pages).map((page) => page.id),
    [],
  );

  if (gameAccountsQuery.isPending) return <DashboardState label="LOADING ARKHOST DATA" />;
  if (gameAccountsQuery.isError) return <DashboardState label="ARKHOST DATA UNAVAILABLE" />;
  if (gameAccounts.length === 0) return <DashboardState label="NO GAME ACCOUNTS" />;

  if (!gameAccountId || !gameAccount) {
    const firstGameAccount = gameAccounts[0];
    if (!firstGameAccount) return null;
    return (
      <Redirect
        href={dashboardPageHref(
          dashboardNavigation.defaultPage.id,
          firstGameAccount.account,
        )}
      />
    );
  }

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
        {screens.map((screen) => (
          <DashboardTabs.Screen key={screen} name={screen} />
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
