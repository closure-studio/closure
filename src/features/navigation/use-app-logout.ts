import { useCallback } from 'react';
import { useNavigation, useRouter } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import { useSessionBackdrop } from '@/features/session';
import { useAppStore } from '@/store';

export function useAppLogout() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { resetBackdropTint } = useSessionBackdrop();

  return useCallback(() => {
    resetBackdropTint();
    logout();
    router.replace(ROUTES.login);
  }, [logout, resetBackdropTint, router]);
}

export function useReturnToDashboard() {
  const appScopeNavigation = useNavigation('/(app)');
  const router = useRouter();

  return useCallback(() => {
    if (appScopeNavigation.canGoBack()) {
      appScopeNavigation.goBack();
      return;
    }
    router.replace(ROUTES.dashboard);
  }, [appScopeNavigation, router]);
}
