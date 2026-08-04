import type { ImperativeRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

import { dismissTopBackOverlay } from '@/hooks/use-back-dismissal';
import { dashboardNavigation } from './navigation-config';
import type { SettingsPageRoute } from './navigation-config';

const DASHBOARD_PATH = '/dashboard';
const SETTINGS_PATH = '/settings';

export type NavigationBackAction = 'delegate' | 'exit-app' | 'return-dashboard';

function isPathOrDescendant(pathname: string, parentPath: string): boolean {
  return pathname === parentPath || pathname.startsWith(`${parentPath}/`);
}

export function resolveNavigationBackAction(pathname: string): NavigationBackAction {
  if (isPathOrDescendant(pathname, SETTINGS_PATH)) return 'return-dashboard';
  if (isPathOrDescendant(pathname, DASHBOARD_PATH)) return 'exit-app';
  return 'delegate';
}

function useHardwareBackHandler(handler: () => boolean): void {
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handler);
    return () => subscription.remove();
  }, [handler]);
}

export function useNavigationBackHandler(
  pathname: string,
  onReturnToDashboard: () => void,
): void {
  const handleHardwareBack = useCallback(() => {
    if (dismissTopBackOverlay()) return true;

    switch (resolveNavigationBackAction(pathname)) {
      case 'return-dashboard':
        onReturnToDashboard();
        return true;
      case 'exit-app':
        BackHandler.exitApp();
        return true;
      case 'delegate':
        return false;
    }
  }, [onReturnToDashboard, pathname]);

  useHardwareBackHandler(handleHardwareBack);
}

type SettingsBackNavigationOptions = {
  pathname: string;
  router: ImperativeRouter;
  settingsRoute: SettingsPageRoute;
};

/**
 * Keeps the source Dashboard route immediately below Settings. Direct Settings entry
 * has no source route, so it is normalized above Dashboard Overview.
 */
export function useSettingsBackNavigation({
  pathname,
  router,
  settingsRoute,
}: SettingsBackNavigationOptions) {
  const pendingSettingsRoute = useRef<SettingsPageRoute | null>(null);
  const initialSettingsHistoryChecked = useRef(false);
  const dashboardRoute = dashboardNavigation.defaultPage.route;

  useEffect(() => {
    const pendingRoute = pendingSettingsRoute.current;
    if (pathname === dashboardRoute && pendingRoute) {
      pendingSettingsRoute.current = null;
      router.push(pendingRoute);
      return;
    }

    if (
      initialSettingsHistoryChecked.current
      || !isPathOrDescendant(pathname, SETTINGS_PATH)
    ) {
      return;
    }

    initialSettingsHistoryChecked.current = true;
    if (router.canDismiss()) return;

    pendingSettingsRoute.current = settingsRoute;
    router.replace(dashboardRoute);
  }, [dashboardRoute, pathname, router, settingsRoute]);

  const enterSettings = useCallback((route: SettingsPageRoute) => {
    if (pendingSettingsRoute.current) return;
    router.push(route);
  }, [router]);

  const returnToDashboard = useCallback(() => {
    if (router.canDismiss()) {
      router.back();
      return;
    }

    router.replace(dashboardRoute);
  }, [dashboardRoute, router]);

  return { enterSettings, returnToDashboard };
}
