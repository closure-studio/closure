import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { dismissTopBackOverlay } from '@/hooks/use-back-dismissal';

export type NavigationBackAction = 'delegate' | 'exit-app' | 'return-dashboard';

function isPathOrDescendant(pathname: string, parentPath: string): boolean {
  return pathname === parentPath || pathname.startsWith(`${parentPath}/`);
}

export function resolveNavigationBackAction(pathname: string): NavigationBackAction {
  if (isPathOrDescendant(pathname, ROUTES.settings)) return 'return-dashboard';
  if (isPathOrDescendant(pathname, ROUTES.dashboard)) return 'exit-app';
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
