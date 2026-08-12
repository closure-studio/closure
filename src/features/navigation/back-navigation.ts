import type { ImperativeRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

import { dismissTopBackOverlay } from '@/hooks/use-back-dismissal';
import { dashboardNavigation } from './navigation-config';

const DASHBOARD_PATH = '/dashboard';
const SETTINGS_PATH = '/settings';

export function navigateBackToDashboard(router: ImperativeRouter): void {
  if (router.canDismiss()) {
    router.back();
    return;
  }

  router.replace(dashboardNavigation.defaultPage.route);
}

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
