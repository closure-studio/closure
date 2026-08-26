import { Redirect } from 'expo-router';
import { Tabs as DashboardTabs } from 'expo-router/tabs';
import { useEffect, useMemo } from 'react';
import { getTokens } from 'tamagui';

import {
  DashboardRouteProvider,
  selectBackdropTint,
  useDashboardRoute,
} from '@/features/dashboard';
import {
  DashboardFrame,
  DashboardSmallScreenTabBar,
  dashboardNavigation,
} from '@/features/navigation';
import { useSessionBackdrop } from '@/features/session';
import { useLayoutSize } from '@/providers/layout-size-provider';
import { ROUTES } from '@/constants/routes';

function DashboardAccountContent() {
  const colors = getTokens().color;
  const layoutSize = useLayoutSize();
  const { setBackdropTint } = useSessionBackdrop();
  const { gameAccountId, gameAccount } = useDashboardRoute();
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

  if (!gameAccountId || !gameAccount) return <Redirect href={ROUTES.dashboard} />;

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
        tabBar={layoutSize === 'small' ? (props) => <DashboardSmallScreenTabBar {...props} /> : () => null}
      >
        {screens.map((screen) => (
          <DashboardTabs.Screen key={screen} name={screen} />
        ))}
      </DashboardTabs>
    </DashboardFrame>
  );
}

export default function DashboardAccountLayout() {
  return (
    <DashboardRouteProvider>
      <DashboardAccountContent />
    </DashboardRouteProvider>
  );
}
